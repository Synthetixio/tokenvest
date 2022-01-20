import { atom, selector, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import vesterAbi from '../../abis/Vester.json'

/**** STATE ****/

export const eventsState = atom({
    key: 'eventsState',
    default: {}
});

export const getEvents = selector({
    key: 'getEvents',
    get: ({ get }) => {
        return Object.values(get(eventsState))
    },
    set: () => ({ get, set }, newValue) => {
        set(eventsState, Object.assign({}, get(eventsState), newValue))
    }
});

export const getEventsByTokenId = selectorFamily({
    key: 'getEventsByTokenId',
    get: (tokenId) => ({ get }) => {
        return Object.values(get(eventsState)).filter((e) => e.tokenId == tokenId)
    },
    set: () => ({ get, set }, newValue) => {
        set(eventsState, Object.assign({}, get(eventsState), newValue))
    }
});


/**** ACTIONS ****/

export const fetchEvents = async (setEvents) => {
    const provider = new ethers.providers.Web3Provider(window?.ethereum)
    const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, provider); // should be provider.getSigner() ?

    let newEvents = {}

    // TODO: Make below more abstract, just gather all events
    const redemptionsFilter = vesterContract.filters.Redemption();
    const redemptionsEvents = await vesterContract.queryFilter(redemptionsFilter, 0, "latest");
    for (const log of redemptionsEvents) {
        newEvents[`${log.transactionHash}-${log.logIndex}`] = {
            type: "Redemption",
            blockNumber: log.blockNumber,
            timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
            transactionHash: log.transactionHash,
            ...log.args
        }
    }

    const grantUpdateFilter = vesterContract.filters.GrantUpdate();
    const grantUpdateEvents = await vesterContract.queryFilter(grantUpdateFilter, 0, "latest");
    for (const log of grantUpdateEvents) {
        newEvents[`${log.transactionHash}-${log.logIndex}`] = {
            type: "Grant Update",
            blockNumber: log.blockNumber,
            timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
            transactionHash: log.transactionHash,
            ...log.args
        }
    }

    setEvents(newEvents)
    return Promise.all([redemptionsEvents, grantUpdateEvents])
}