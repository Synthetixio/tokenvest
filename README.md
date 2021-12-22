# SNX Vestoooor

## Notes/Considerations
* Does not support multiple grants to the same wallet address
* Consider workflow for sending arbitrary tokens in exchange and allow owner to redeem
* Withdraw SNX balance back to owner?
* Deployer will be owner, is this what we want?
* Add upgradeability proxy?
* Add on-chain storage of all grantee addresses?
* Think about change address: transferGrant(address fromAddress, address toAddress)
    * Should this be in the UI for user and admin?

Claimer UI
- Show amount vested, info on your vesting schedule, etc.
- Allow 'buy' the grant/options, start w/ sUSD

Admin UI
- show all events
- CRUD for grants
WILL ADMIN BE A MULTISIG?

## Dev Environment

* Run `npx hardhat node`
* Update testAddress in local-deploy script
* In a seperate tab, `npx hardhat run --network localhost scripts/local-deploy.js`
* Then start the front end, `cd frontend && npm run dev`