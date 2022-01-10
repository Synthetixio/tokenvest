# SNX Vester

This is a smart contract and dApp that manages token grants with vesting schedules.

Each grant is represented as an NFT. It has the following properties:
* `startTimestamp` - The timestamp (in seconds) when the grant begins to vest. 
* `cliffTimestamp` - The timestamp (in seconds) before which no tokens can be redeemed.
* `vestInterval` - The duration (in seconds) for each additional amount to vest.
* `vestAmount` - The amount of tokens that will vest each interval.
* `totalAmount` - The total amount of tokens that will vest for this grant.
* `amountRedeemed` - The amount of tokens already redeemed under this grant.

The contract owner is able to manage grants using the `mint()`, `burn()`, and `updateGrant()` functions. The owner can also withdraw tokens using the `withdraw()` function. The dApp assumes this will be a multisig wallet on Gnosis Safe. Ownership can be transferred using the `nominateOwner()` and `acceptOwnership()` functions.

Holders of the NFT are able to redeem available tokens using the `redeem()` or `redeemWithTransfer()` methods.

## Development Environment

* Run `npx hardhat node`
* In a seperate tab, `npx hardhat run --network localhost scripts/local-deploy.js`.
* Then start the front end, `cd frontend && npm run dev`