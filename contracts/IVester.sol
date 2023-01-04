//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


/// @title Vesting Contract
/// @author Noah Litvin (@noahlitvin) and Amar(mohindar99)
/// @notice This contract allows the recipient of a grant to redeem tokens each vesting interval, up to a total amount with an optional cliff.
interface IVesters {

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

    /// @notice Redeem all available vested tokens from a single grant
    function redeem(uint tokenId) external ;

    /// @notice Redeem multiple token grants, any failure will revert all redeems
    function redeemMultiple(uint[] calldata tokenIds) external ;

    /// @notice Redeem all available vested tokens from all grants, may run out of gas, in which case
    /// use redeemMultiple(). Any failure will revert all redeems.
    function redeemAll() external ;

    /// @notice Redeem all available vested tokens and transfer in arbitrary tokens (to make this an exchange rather than income)
    /// @param incomingTokenAddress The address of the token being transferred in
    /// @param incomingTokenAmount The amount of the token being transferred in
    function redeemWithTransfer(uint tokenId, address incomingTokenAddress, uint incomingTokenAmount) external ;
    
    /// @notice Calculate the amount of tokens currently available for redemption for a given grant
    /// returns 0 if grant was cancelled
    /// @dev This subtracts the amount of previously redeemed token from the total amount that has vested.
    /// @param tokenId The ID of the grant
    /// @return The amount available for redemption, denominated in tokens * 10^18
    function availableForRedemption(uint tokenId) external view returns (uint128) ;

    /// @notice Calculate the amount that has vested for a given grant
    /// @param tokenId The ID of the grant
    /// @return The amount of vested tokens, denominated in tokens * 10^18
    function amountVested(uint tokenId) external view returns (uint128) ;

    /// @notice Supply tokens to this contract so that tokens don't need to be sent directly to contract
    /// @param tokenAddress The address of the ERC20 token to supply
    /// @param amount amount to supply
    function supply(address tokenAddress, uint amount) external ;
    /// @notice Withdraw tokens owned by this contract to the caller
    /// @dev Only the owner of the contract may call this function.
    /// @param withdrawalTokenAddress The address of the ERC20 token to redeem
    function withdraw(address withdrawalTokenAddress, uint withdrawalTokenAmount) external ;

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
    function replaceGrant(uint tokenId, address tokenAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval) external  ;
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
    function mint(address granteeAddress, address tokenAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval) external ;

    /// @notice cancel a grant, cannot be undone (new grant has to be minted)
    /// @dev Only the owner of the contract may call this function.
    /// @param tokenId The ID of the grant
    function cancelGrant(uint tokenId) external ;
    /// @notice Nominate a new owner
    /// @dev Only the owner of the contract may call this function.
    function nominateOwner(address nominee) external ;

    /// @notice Accept ownership if nominated
    function acceptOwnership() external;

     /// event used for redeeming token details 
    event Redemption(uint indexed tokenId, address indexed redeemerAddress, uint128 amount);
    /// event is used whenever their is a grant is created
    event GrantCreated(uint indexed tokenId);
    // event is used to log the cancelled grant created by the owner
    event GrantCancelled(uint indexed tokenId);
    // event is used to show the total supply 
    event Supply(address supplierAddress, address indexed tokenAddress, uint amount);
    // event is used to track the total withdrawal from the grant 
    event Withdrawal(address indexed withdrawerAddress, address indexed withdrawalTokenAddress, uint amount);
     //event is used to track the logs of the newowner address
    event OwnerNomination(address indexed newOwner);
    //event is used to keep track of new and old owners of the contract 
    event OwnerUpdate(address indexed oldOwner, address indexed newOwner);
}