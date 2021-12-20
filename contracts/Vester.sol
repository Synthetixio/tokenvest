//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/// @title SNX Vesting Contract
/// @author Noah Litvin (@noahlitvin)
/// @notice This contract allows the recipient of a grant to redeem SNX tokens each quarter, up to a total amount with an optional cliff.
contract Vester is Ownable {

    struct Grant {
        uint64 startTimestamp;
        uint64 cliffTimestamp;
        uint128 quarterlyAmount;
        uint128 totalAmount;
        uint128 amountRedeemed;
    }
    mapping (address => Grant) grants;

    /// @notice Redeem all available vested SNX for the calling address
    function redeem() external {
        uint128 amount = availableForRedemption(msg.sender);
        require(amount > 0, "You don't have any SNX currently available for redemption.");

        IERC20 snxContract = IERC20(0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F);
        require(snxContract.balanceOf(address(this)) >= amount, "More SNX must be transferred to this contract before you can redeem.");

        grants[msg.sender].amountRedeemed += amount;
        snxContract.transfer(msg.sender, amount);

        emit Redemption(msg.sender, amount);
    }

    /// @notice Calculate the amount of SNX currently available for redemption for a given grantee
    /// @dev This subtracts the amount of previously redeemed SNX from the total amount that has vested
    /// @param redeemerAddress The address of the grantee
    /// @return The amount available for redemption, denominated in SNX * 10^18
    function availableForRedemption(address redeemerAddress) public view returns (uint128) {
        return amountVested(redeemerAddress) - grants[redeemerAddress].amountRedeemed;
    }

    /// @notice Calculate the amount that has vested for a given address
    /// @param redeemerAddress The address of the grantee
    /// @return The amount of vested SNX, denominated in SNX * 10^18
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
    /// @param cliffTimestamp Before this timestamp, no SNX can be redeemed
    /// @param quarterlyAmount The amount of SNX that will vest for the recipient each quarter, denominated in SNX * 10^18
    /// @param totalAmount The total amount of SNX that will be granted to the recipient, denominated in SNX * 10^18
    /// @param amountRedeemed The amount of SNX already redeemed by this recipient
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
    /// @param totalSNX The size of the grant, denominated in SNX
    function createGrant(address granteeAddress, uint32 totalSNX) external onlyOwner {
        updateGrant(
            granteeAddress,
            uint64(block.timestamp),
            uint64(block.timestamp) + 7889400 * 2,
            totalSNX * 1 ether / 4 * 3,
            totalSNX * 1 ether,
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
