import { atom, selector, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import erc20Abi from '../../abis/SampleToken.json'
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

    const grantUpdatedFilter = vesterContract.filters.GrantUpdated();
    const grantUpdatedEvents = await vesterContract.queryFilter(grantUpdatedFilter, 0, "latest");
    for (const log of grantUpdatedEvents) {
        const erc20Contract = new ethers.Contract(log.args.tokenAddress, erc20Abi.abi, provider); // should be provider.getSigner() ?

        newEvents[`${log.transactionHash}-${log.logIndex}`] = {
            type: "Grant Updated",
            blockNumber: log.blockNumber,
            timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
            transactionHash: log.transactionHash,
            tokenSymbol: await erc20Contract.symbol(),
            ...log.args
        }
    }

    const grantCreatedFilter = vesterContract.filters.GrantCreated();
    const grantCreatedEvents = await vesterContract.queryFilter(grantCreatedFilter, 0, "latest");
    for (const log of grantCreatedEvents) {
        newEvents[`${log.transactionHash}-${log.logIndex}`] = {
            type: "Grant Created",
            blockNumber: log.blockNumber,
            timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
            transactionHash: log.transactionHash,
            ...log.args
        }
    }

    const grantDeletedFilter = vesterContract.filters.GrantDeleted();
    const grantDeletedEvents = await vesterContract.queryFilter(grantDeletedFilter, 0, "latest");
    for (const log of grantDeletedEvents) {
        newEvents[`${log.transactionHash}-${log.logIndex}`] = {
            type: "Grant Deleted",
            blockNumber: log.blockNumber,
            timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
            transactionHash: log.transactionHash,
            ...log.args
        }
    }

    setEvents(newEvents)
    return Promise.all([redemptionsEvents, grantUpdatedEvents, grantCreatedEvents])
}