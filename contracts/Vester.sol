//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/interfaces/IERC20.sol";

/// @title Vesting Contract
/// @author Noah Litvin (@noahlitvin)
/// @notice This contract allows the recipient of a grant to redeem tokens each quarter, up to a total amount with an optional cliff.
contract Vester {

    struct Grant {
        uint128 quarterlyAmount;
        uint128 totalAmount;
        uint128 amountRedeemed;
        uint64 startTimestamp;
        uint64 cliffTimestamp;
        uint32 vestInterval;
        address transferNominee;
    }

    address public owner;
    address public nominatedOwner;
    address public tokenAddress;
    mapping (address => Grant) public grants;

    constructor(address _owner, address _tokenAddress) {
        owner = _owner;
        tokenAddress = _tokenAddress;
    }

    /// @notice Redeem all available vested tokens for the calling address
    function redeem() public {
        uint128 amount = availableForRedemption(msg.sender);
        require(amount > 0, "You don't have any tokens currently available for redemption.");

        IERC20 tokenContract = IERC20(tokenAddress);
        require(tokenContract.balanceOf(address(this)) >= amount, "More tokens must be transferred to this contract before you can redeem.");

        grants[msg.sender].amountRedeemed += amount;
        tokenContract.transfer(msg.sender, amount);

        emit Redemption(msg.sender, amount);
    }

    /// @notice Redeem all available vested tokens for the calling address and transfer in arbitrary tokens (to make this an exchange rather than income)
    /// @param incomingTokenAddress The address of the token being transferred in
    /// @param incomingTokenAmount The amount of the token being transferred in
    function redeemWithTransfer(address incomingTokenAddress, uint incomingTokenAmount) external {
        IERC20 incomingTokenContract = IERC20(incomingTokenAddress);
        require(
            incomingTokenContract.transferFrom(msg.sender, address(this), incomingTokenAmount),
            "Incoming tokens failed to transfer."
        );
        redeem();
    }

    /// @notice Calculate the amount of tokens currently available for redemption for a given grantee
    /// @dev This subtracts the amount of previously redeemed token from the total amount that has vested.
    /// @param redeemerAddress The address of the grantee
    /// @return The amount available for redemption, denominated in tokens * 10^18
    function availableForRedemption(address redeemerAddress) public view returns (uint128) {
        return amountVested(redeemerAddress) - grants[redeemerAddress].amountRedeemed;
    }

    /// @notice Calculate the amount that has vested for a given address
    /// @param redeemerAddress The address of the grantee
    /// @return The amount of vested tokens, denominated in tokens * 10^18
    function amountVested(address redeemerAddress) public view returns (uint128) {
        // Nothing has vested until the cliff has past.
        if(block.timestamp < grants[redeemerAddress].cliffTimestamp){
            return 0;
        }

        // Calculate the number of quarters elapsed (will round down) multiplied by the amount to vest per vesting interval.
        uint128 amount = ((uint128(block.timestamp) - grants[redeemerAddress].startTimestamp) / grants[redeemerAddress].vestInterval) * grants[redeemerAddress].quarterlyAmount;

        // The total amount vested cannot exceed total grant size.
        if(amount > grants[redeemerAddress].totalAmount){
            return grants[redeemerAddress].totalAmount;
        }

        return amount;
    }

    /// @notice Withdraw all tokens in this contract to the caller
    /// @dev Only the owner of the contract may call this function.
    /// @param withdrawalTokenAddress The address of the ERC20 token to redeem
    function withdraw(address withdrawalTokenAddress) public onlyOwner {
        IERC20 tokenContract = IERC20(withdrawalTokenAddress);
        uint amount = tokenContract.balanceOf(address(this));

        tokenContract.transfer(msg.sender, amount);

        emit Withdrawal(msg.sender, withdrawalTokenAddress, amount);
    }

    /// @notice Update the data pertaining to a grant
    /// @dev Only the owner of the contract may call this function.
    /// @param granteeAddress The address of the grant recipient
    /// @param startTimestamp The timestamp defining the start of the vesting schedule
    /// @param cliffTimestamp Before this timestamp, no tokens can be redeemed
    /// @param quarterlyAmount The amount of tokens that will vest for the recipient each quarter, denominated in tokens * 10^18
    /// @param totalAmount The total amount of tokens that will be granted to the recipient, denominated in tokens * 10^18
    /// @param amountRedeemed The amount of tokens already redeemed by this recipient
    /// @param vestInterval The vesting period in seconds
    function updateGrant(address granteeAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 quarterlyAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval) public onlyOwner {
        grants[granteeAddress].startTimestamp = startTimestamp;
        grants[granteeAddress].cliffTimestamp = cliffTimestamp;
        grants[granteeAddress].quarterlyAmount = quarterlyAmount;
        grants[granteeAddress].totalAmount = totalAmount;
        grants[granteeAddress].amountRedeemed = amountRedeemed;
        grants[granteeAddress].vestInterval = vestInterval;

        emit GrantUpdate(granteeAddress, startTimestamp, cliffTimestamp, quarterlyAmount, totalAmount, amountRedeemed, vestInterval);
    }

    /// @notice Create a grant that vests quarterly over three years with a six month cliff
    /// @dev Only the owner of the contract may call this function. This is a convenience function that wraps updateGrant.
    /// @param granteeAddress The address of the grant recipient
    /// @param grantSize The size of the grant, denominated in tokens
    function createGrant(address granteeAddress, uint128 grantSize) external onlyOwner {
        updateGrant(
            granteeAddress,
            uint64(block.timestamp),
            uint64(block.timestamp) + 7889400 * 2,
            grantSize * 1e18 / 4 / 3,
            grantSize * 1e18,
            0,
            7889400
        );
    }

    /// @notice Revoke an existing grant
    /// @dev Only the owner of the contract may call this function. This is a convenience function that wraps updateGrant.
    /// @param granteeAddress The address of the grantee to revoke
    function revokeGrant(address granteeAddress) external onlyOwner {
        updateGrant(
            granteeAddress,
            grants[granteeAddress].startTimestamp,
            grants[granteeAddress].cliffTimestamp,
            grants[granteeAddress].quarterlyAmount,
            0,
            grants[granteeAddress].amountRedeemed,
            grants[granteeAddress].vestInterval
        );
    }

    /// @notice Nominate an address to receive the caller's grant
    /// @param nominee The address that will be able to accept the grant transfer
    function nominateGrantTransfer(address nominee) external {
        grants[msg.sender].transferNominee = nominee;

        emit GrantTransferNomination(msg.sender, nominee);
    }

    /// @notice Accept a grant transfer
    /// @param transferer The address currently assigned to the grant the caller is receiving
    function acceptGrantTransfer(address transferer) external {
        require(grants[transferer].transferNominee == msg.sender, "You have not been nominated to accept this grant.");
        
        // Assign the transferer's grant to the caller
        grants[msg.sender] = grants[transferer];

        // Effectively revoke the transferer's grant
        grants[transferer].totalAmount = 0;

        // Prevent the recipient from transfering a future grant from the recipient unless nominated again
        grants[transferer].transferNominee = address(0);

        emit GrantTransferAcceptance(transferer, msg.sender);
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
        require(msg.sender == owner);
        _;
    }

    event GrantUpdate(address indexed granteeAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 quarterlyAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval);
    event Redemption(address indexed redeemerAddress, uint128 amount);
    event Withdrawal(address indexed withdrawerAddress, address indexed withdrawalTokenAddress, uint amount);
    event GrantTransferNomination(address indexed sender, address indexed recipient);
    event GrantTransferAcceptance(address indexed sender, address indexed recipient);
    event OwnerNomination(address indexed newOwner);
    event OwnerUpdate(address indexed oldOwner, address indexed newOwner);
}
