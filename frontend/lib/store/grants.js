import { atom, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'

/**** STATE ****/

export const grantsState = atom({
    key: 'grantsState',
    default: {},
});

export const grantState = selectorFamily({
    key: 'grantState',
    get: (address) => ({ get }) => {
        return get(grantsState)[address];
    },
    set: (address) => ({ get, set }, newValue) => {
        let wrappedNewValue = {}
        wrappedNewValue[address] = newValue
        set(grantsState, Object.assign({}, get(grantsState), wrappedNewValue))
    }
});


/**** ACTIONS ****/

// rename to fetch?
export const getGrant = async (setGrant, address) => {
    const provider = new ethers.providers.Web3Provider(window?.ethereum)
    const vesterContract = new ethers.Contract("0x610178dA211FEF7D417bC0e6FeD39F05609AD788", vesterAbi.abi, provider);

    const grantData = await vesterContract.grants(address)
    const amountVested = await vesterContract.amountVested(address)

    setGrant({
        amountVested,
        ...grantData
    })

    return Promise.all([grantData, amountVested])
}

export const getGrants = async () => {
    let addresses = []

    // Get all addresses with grants based on events
    const grantUpdateFilter = vesterContract.filters.GrantUpdate();
    const grantUpdateEvents = await vesterContract.queryFilter(grantUpdateFilter, 0, "latest");
    for (const log of grantUpdateEvents) {
        const address = log.args.granteeAddress
        if (!addresses.includes(address)) {
            await getGrant(address)
            addresses.push(address)
        }
    }
}

export const redeemGrant = async () => { //pass in signer as arg? there's always going to just be one in context, so it shouldn't be necessary
    await vesterContract.connect(provider.getSigner()).redeem()
    await getGrant(wallet.account) // is this right?
    // Then reload this grant + events?
}