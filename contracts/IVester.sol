//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface itokenvest {

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
    
    function redeem(uint tokenId) external ;

    function redeemMultiple(uint[] calldata tokenIds) external ;

    
    function redeemAll() external ;

    
    function redeemWithTransfer(uint tokenId, address incomingTokenAddress, uint incomingTokenAmount) external ;
    
    
    function availableForRedemption(uint tokenId) external view returns (uint128) ;

   
    function amountVested(uint tokenId) external view returns (uint128) ;

  
    function withdraw(address withdrawalTokenAddress, uint withdrawalTokenAmount) external ;


    function replaceGrant(uint tokenId, address tokenAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval) external  ;

    function mint(address granteeAddress, address tokenAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval) external ;
    
    function cancelGrant(uint tokenId) external ;

    function nominateOwner(address nominee) external ;

    function acceptOwnership() external;

     /// event used for redeeming tokenetails 
    event Redemption(uint indexed tokenId, address indexed redeemerAddress, uint128 amount);
    /// event is used whenever their ia grant is created
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