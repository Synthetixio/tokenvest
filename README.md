# SNX Vestoooor

## TODO
* Add Recoil (Redeem should update RecentActivity)
* Determine deployer and owner configurations
  * Should the deployer be the owner?
  * Will the deployer and/or owner be a multisig?
  * Do we need an upgradeability proxy?
* Additional Considerations:
  * This currently only supports one grant per address. Is this okay?
  * Should we add on-chain storage of all grantee addresses (for composability)?
  * Should it be possible for the owner to withdraw back the SNX balance from the contract?
  * Should we bother having the convenience methods in the smart contract?
* New Feature: Allow transferOwnership of grant.
* New Feature: Allow sending arbitrary tokens in exchange for withdrawal.

## Dev Environment
*Instructions WIP*

* Run `npx hardhat node`
* Update testAddress in local-deploy script
* In a seperate tab, `npx hardhat run --network localhost scripts/local-deploy.js`
* Then start the front end, `cd frontend && npm run dev`