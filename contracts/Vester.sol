//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Vesting Contract
/// @author Noah Litvin (@noahlitvin)
/// @notice This contract allows the recipient of a grant to redeem tokens each vesting interval, up to a total amount with an optional cliff.
contract Vester is ERC721Enumerable, ReentrancyGuard {

    using SafeERC20 for IERC20;

    struct Grant {
        uint128 vestAmount;
        uint128 totalAmount;
        uint128 amountRedeemed;
        uint64 startTimestamp;
        uint64 cliffTimestamp;
        uint32 vestInterval;
        address tokenAddress;
        bool cancelled;
    }

    address public owner;
    address public nominatedOwner;
    uint public tokenCounter;
    mapping (uint => Grant) public grants;

    constructor(string memory name, string memory symbol, address _owner) ERC721(name, symbol) {
        owner = _owner;
    }

    /// @notice Redeem all available vested tokens from a single grant
    function redeem(uint tokenId) public {        
        _redeem(tokenId, true);
    }

    /// @notice Redeem multiple token grants, any failure will revert all redeems
    function redeemMultiple(uint[] calldata tokenIds) public {
        for (uint i = 0; i < tokenIds.length; i++) {
            redeem(tokenIds[i]);
        }
    }

    /// @notice Redeem all available vested tokens from all grants, may run out of gas, in which case
    /// use redeemMultiple(). Any failure will revert all redeems.
    function redeemAll() public {
        uint numTokens = balanceOf(msg.sender); // number of tokens owned by sender
        for (uint i = 0; i < numTokens; i++) {
            // skip non vested grants silently
            _redeem(tokenOfOwnerByIndex(msg.sender, i), false);
        }
    }

    /// @dev nonReentrant because may be used in a loop (with different tokens)
    function _redeem(uint tokenId, bool requireNonZero) internal nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "You don't own this grant.");

        uint128 amount = availableForRedemption(tokenId);

        if (amount == 0) {
            if (requireNonZero) {
                revert("No tokens available for redemption");        
            } else {
                return; // nothing to do
            }
        }

        IERC20 tokenContract = IERC20(grants[tokenId].tokenAddress);

        // this is for clarity only (safetransfer revert may be less clear)
        require(tokenContract.balanceOf(address(this)) >= amount, "More tokens must be transferred to this contract before you can redeem.");

        grants[tokenId].amountRedeemed += amount;
        tokenContract.safeTransfer(msg.sender, amount);

        emit Redemption(tokenId, msg.sender, amount);
    }

    /// @notice Redeem all available vested tokens and transfer in arbitrary tokens (to make this an exchange rather than income)
    /// @param incomingTokenAddress The address of the token being transferred in
    /// @param incomingTokenAmount The amount of the token being transferred in
    function redeemWithTransfer(uint tokenId, address incomingTokenAddress, uint incomingTokenAmount) external {
        IERC20 incomingTokenContract = IERC20(incomingTokenAddress);
        redeem(tokenId);
        incomingTokenContract.safeTransferFrom(msg.sender, address(this), incomingTokenAmount);
    }

    /// @notice Calculate the amount of tokens currently available for redemption for a given grant
    /// returns 0 if grant was cancelled
    /// @dev This subtracts the amount of previously redeemed token from the total amount that has vested.
    /// @param tokenId The ID of the grant
    /// @return The amount available for redemption, denominated in tokens * 10^18
    function availableForRedemption(uint tokenId) public view returns (uint128) {
        uint128 vested = amountVested(tokenId);
        uint128 redeemed = grants[tokenId].amountRedeemed;
        if (grants[tokenId].cancelled || vested < redeemed ) {
            return 0;
        } else {
            return vested - redeemed;
        }        
    }

    /// @notice Calculate the amount that has vested for a given address
    /// @param tokenId The ID of the grant
    /// @return The amount of vested tokens, denominated in tokens * 10^18
    function amountVested(uint tokenId) public view returns (uint128) {
        Grant storage grant = grants[tokenId];

        // Nothing has vested until the cliff has past.
        if(block.timestamp < grant.cliffTimestamp){
            return 0;
        }

        // Calculate the number of intervals elapsed (will round down) multiplied by the amount to vest per vesting interval.
        uint128 amount = ((uint128(block.timestamp) - grant.startTimestamp) / grant.vestInterval) * grant.vestAmount;

        // The total amount vested cannot exceed total grant size.
        if(amount > grant.totalAmount){
            return grant.totalAmount;
        }

        return amount;
    }

    /// @notice Supply tokens to this contract so that tokens don't need to be sent directly to contract
    /// @param tokenAddress The address of the ERC20 token to supply
    /// @param amount amount to supply
    function supply(address tokenAddress, uint amount) external {
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);

        emit Supply(msg.sender, tokenAddress, amount);
    }

    /// @notice Withdraw tokens owned by this contract to the caller
    /// @dev Only the owner of the contract may call this function.
    /// @param withdrawalTokenAddress The address of the ERC20 token to redeem
    function withdraw(address withdrawalTokenAddress, uint withdrawalTokenAmount) public onlyOwner {
        IERC20(withdrawalTokenAddress).safeTransfer(msg.sender, withdrawalTokenAmount);

        emit Withdrawal(msg.sender, withdrawalTokenAddress, withdrawalTokenAmount);
    }

    /// @notice Replace an existing grant by cancelling the old one and minting a new one
    /// @dev Only the owner of the contract may call this function.
    /// @param tokenId The ID of the grant
    /// @param tokenAddress The address of the ERC-20 being granted
    /// @param startTimestamp The timestamp defining the start of the vesting schedule
    /// @param cliffTimestamp Before this timestamp, no tokens can be redeemed
    /// @param vestAmount The amount of tokens that will vest for the recipient each interval, denominated in tokens * 10^18
    /// @param totalAmount The total amount of tokens that will be granted to the recipient, denominated in tokens * 10^18
    /// @param amountRedeemed The amount of tokens already redeemed by this recipient
    /// @param vestInterval The vesting period in seconds
    function replaceGrant(uint tokenId, address tokenAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval) public onlyOwner {        
        cancelGrant(tokenId);
        mint(ownerOf(tokenId), tokenAddress, startTimestamp, cliffTimestamp, vestAmount, totalAmount, amountRedeemed, vestInterval);
    }

    /// @notice Create a new grant
    /// @dev Only the owner of the contract may call this function.
    /// @param granteeAddress The address of the grant recipient
    /// @param tokenAddress The address of the ERC-20 being granted
    /// @param startTimestamp The timestamp defining the start of the vesting schedule
    /// @param cliffTimestamp Before this timestamp, no tokens can be redeemed
    /// @param vestAmount The amount of tokens that will vest for the recipient each interval, denominated in tokens * 10^18
    /// @param totalAmount The total amount of tokens that will be granted to the recipient, denominated in tokens * 10^18
    /// @param amountRedeemed The amount of tokens already redeemed by this recipient
    /// @param vestInterval The vesting period in seconds
    function mint(address granteeAddress, address tokenAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval) public onlyOwner {
        // input validation
        require(startTimestamp > 0, "startTimestamp is zero"); // probably immediately redeemable
        require(vestInterval > 0, "vestInterval is zero"); // don't divide by zero
        require(amountRedeemed <=  totalAmount, "redeemed higher than total"); 

        uint tokenId = tokenCounter;
        tokenCounter++;

        grants[tokenId] = Grant({
            vestAmount: vestAmount,
            totalAmount: totalAmount,
            amountRedeemed: amountRedeemed,
            startTimestamp: startTimestamp,
            cliffTimestamp: cliffTimestamp,
            vestInterval: vestInterval,
            tokenAddress: tokenAddress,
            cancelled: false
        });
        _safeMint(granteeAddress, tokenId);
        emit GrantCreated(tokenId);
    }

    /// @notice cancel a grant, cannot be undone (new grant has to be minted)
    /// @dev Only the owner of the contract may call this function.
    /// @param tokenId The ID of the grant
    function cancelGrant(uint tokenId) public onlyOwner {
        require(!grants[tokenId].cancelled, "Already cancelled");
        grants[tokenId].cancelled = true;
        emit GrantCancelled(tokenId);
    }

    /// @notice Nominate a new owner
    /// @dev Only the owner of the contract may call this function.
    function nominateOwner(address nominee) external onlyOwner {
        nominatedOwner = nominee;
        emit OwnerNomination(nominee);
    }

    /// @notice Accept ownership if nominated
    function acceptOwnership() external {
        require(msg.sender == nominatedOwner);
        emit OwnerUpdate(owner, nominatedOwner);
        owner = nominatedOwner;
        nominatedOwner = address(0);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    event Redemption(uint indexed tokenId, address indexed redeemerAddress, uint128 amount);
    event GrantCreated(uint indexed tokenId);
    event GrantCancelled(uint indexed tokenId);
    event Supply(address supplierAddress, address indexed tokenAddress, uint amount);
    event Withdrawal(address indexed withdrawerAddress, address indexed withdrawalTokenAddress, uint amount);
    event OwnerNomination(address indexed newOwner);
    event OwnerUpdate(address indexed oldOwner, address indexed newOwner);
}
