import { atom, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import { useWallet } from 'use-wallet'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'

const wallet = useWallet()
const provider = new ethers.providers.Web3Provider(wallet.ethereum)
const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, provider.getSigner());

// These should all be promises

// getEvents
// getAllEvents

/**** STATE ****/

export const eventsState = atom({
    key: 'eventsState',
    default: {},
});

export const eventsStateByUser = selectorFamily({
    key: 'eventsState',
    get: (address) => ({ get }) => {
        return Object.values(get(eventsState))// TODO: fix me: .filter((g) => g.owner == address)
    },
    set: (eventId) => ({ get, set }, newValue) => {
        let wrappedNewValue = {}
        wrappedNewValue[eventId] = newValue
        set(eventsState, Object.assign({}, get(eventsState), wrappedNewValue))
    }
});


/**** ACTIONS ****/

export const getEvents = async (setEvent) => {
    const provider = new ethers.providers.Web3Provider(window?.ethereum)
    const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, provider); // should be provider.getSigner() ?

    let promises = []

    const totalSupply = await vesterContract.totalSupply();
    for (let i = 0; i < totalSupply.toNumber(); i++) {
        const tokenId = await vesterContract.tokenByIndex(i);
        promises.push(await getGrant(setGrant, tokenId))
    }

    return Promise.all(promises)
}