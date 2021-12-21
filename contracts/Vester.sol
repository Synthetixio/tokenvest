//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/// @title Vesting Contract
/// @author Noah Litvin (@noahlitvin)
/// @notice This contract allows the recipient of a grant to redeem tokens each quarter, up to a total amount with an optional cliff.
contract Vester is Ownable {

    struct Grant {
        uint64 startTimestamp;
        uint64 cliffTimestamp;
        uint128 quarterlyAmount;
        uint128 totalAmount;
        uint128 amountRedeemed;
    }
    mapping (address => Grant) public grants;
    address tokenAddress;

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }

    /// @notice Redeem all available vested tokens for the calling address
    function redeem() external {
        uint128 amount = availableForRedemption(msg.sender);
        require(amount > 0, "You don't have any tokens currently available for redemption.");

        IERC20 tokenContract = IERC20(tokenAddress);
        require(tokenContract.balanceOf(address(this)) >= amount, "More tokens must be transferred to this contract before you can redeem.");

        grants[msg.sender].amountRedeemed += amount;
        tokenContract.transfer(msg.sender, amount);

        emit Redemption(msg.sender, amount);
    }

    /// @notice Calculate the amount of tokens currently available for redemption for a given grantee
    /// @dev This subtracts the amount of previously redeemed token from the total amount that has vested
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

        // Calculate the number of quarters elapsed (will round down) multiplied by the quarterly amount to vest.
        uint128 amount = ((uint128(block.timestamp) - grants[redeemerAddress].startTimestamp) / 7889400) * grants[redeemerAddress].quarterlyAmount;

        // The total amount vested cannot exceed total grant size.
        if(amount > grants[redeemerAddress].totalAmount){
            return grants[redeemerAddress].totalAmount;
        }

        return amount;
    }

    /// @notice Update the data pertaining to a grant
    /// @param granteeAddress The address of the grant recipient
    /// @param startTimestamp The timestamp defining the start of the vesting schedule
    /// @param cliffTimestamp Before this timestamp, no tokens can be redeemed
    /// @param quarterlyAmount The amount of tokens that will vest for the recipient each quarter, denominated in tokens * 10^18
    /// @param totalAmount The total amount of tokens that will be granted to the recipient, denominated in tokens * 10^18
    /// @param amountRedeemed The amount of tokens already redeemed by this recipient
    function updateGrant(address granteeAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 quarterlyAmount, uint128 totalAmount, uint128 amountRedeemed) public onlyOwner {
        grants[granteeAddress].startTimestamp = startTimestamp;
        grants[granteeAddress].cliffTimestamp = cliffTimestamp;
        grants[granteeAddress].quarterlyAmount = quarterlyAmount;
        grants[granteeAddress].totalAmount = totalAmount;
        grants[granteeAddress].amountRedeemed = amountRedeemed;

        emit GrantUpdate(granteeAddress, startTimestamp, cliffTimestamp, quarterlyAmount, totalAmount, amountRedeemed);
    }

    /// @notice Create a grant that vests over three years with a six month cliff
    /// @dev This is a convenience function that wraps updateGrant
    /// @param granteeAddress The address of the grant recipient
    /// @param grantSize The size of the grant, denominated in tokens
    function createGrant(address granteeAddress, uint128 grantSize) external onlyOwner {
        updateGrant(
            granteeAddress,
            uint64(block.timestamp),
            uint64(block.timestamp) + 7889400 * 2,
            grantSize * 1e18 / 4 / 3,
            grantSize * 1e18,
            0
        );
    }

    /// @notice Revoke an existing grant
    /// @dev This is a convenience function that wraps updateGrant
    /// @param granteeAddress The address of the grantee to revoke
    function revokeGrant(address granteeAddress) external onlyOwner {
        updateGrant(
            granteeAddress,
            grants[granteeAddress].startTimestamp,
            grants[granteeAddress].cliffTimestamp,
            grants[granteeAddress].quarterlyAmount,
            0,
            grants[granteeAddress].amountRedeemed
        );
    }

    event GrantUpdate(address indexed granteeAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 quarterlyAmount, uint128 totalAmount, uint128 amountRedeemed);
    event Redemption(address indexed redeemerAddress, uint128 amount);
}
