import { atom, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'
import erc20Abi from '../../../artifacts/contracts/test-helpers/SampleToken.sol/SampleToken.json'
import { parseErrorMessage } from '../../lib/utils/helpers'
import { createStandaloneToast } from '@chakra-ui/react'
import theme from '../../styles/theme'
import { fetchEvents } from "./events";

const toast = createStandaloneToast({ theme })

/**** STATE ****/

export const grantsState = atom({
    key: 'grantsState',
    default: {},
});

export const getGrants = selectorFamily({
    key: 'getGrants',
    get: (address) => ({ get }) => {
        return Object.values(get(grantsState))
    },
    set: () => ({ get, set }, newValue) => {
        let wrappedNewValue = {}
        wrappedNewValue[newValue.tokenId] = newValue
        set(grantsState, Object.assign({}, get(grantsState), wrappedNewValue))
    }
});

export const getGrant = selectorFamily({
    key: 'getGrant',
    get: (tokenId) => ({ get }) => {
        return get(grantsState)[tokenId];
    },
    set: (tokenId) => ({ get, set }, newValue) => {
        let wrappedNewValue = {}
        wrappedNewValue[tokenId] = newValue
        set(grantsState, Object.assign({}, get(grantsState), wrappedNewValue))
    }
});

export const getGrantsByUser = selectorFamily({
    key: 'getGrantsByUser',
    get: (address) => ({ get }) => {
        return Object.values(get(grantsState)).filter((g) => g.owner == address)
    },
    set: () => ({ get, set }, newValue) => {
        let wrappedNewValue = {}
        wrappedNewValue[newValue.tokenId] = newValue
        set(grantsState, Object.assign({}, get(grantsState), wrappedNewValue))
    }
});


/**** ACTIONS ****/

export const fetchGrant = async (setGrant, tokenId) => {
    const provider = new ethers.providers.Web3Provider(window?.ethereum)
    const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, provider); // should be provider.getSigner() ?

    const grantData = await vesterContract.grants(tokenId)
    const amountVested = await vesterContract.amountVested(tokenId)
    const amountAvailable = await vesterContract.availableForRedemption(tokenId)
    const owner = await vesterContract.ownerOf(tokenId)

    setGrant({
        tokenId,
        owner,
        amountVested,
        amountAvailable,
        ...grantData
    })

    return Promise.all([grantData, amountVested, amountAvailable])
}

export const fetchGrants = async (setGrant) => {
    const provider = new ethers.providers.Web3Provider(window?.ethereum)
    const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, provider); // should be provider.getSigner() ?

    let promises = []

    const totalSupply = await vesterContract.totalSupply();
    for (let i = 0; i < totalSupply.toNumber(); i++) {
        const tokenId = await vesterContract.tokenByIndex(i);
        promises.push(await fetchGrant(setGrant, tokenId))
    }

    return Promise.all(promises)
}

export const redeemGrant = async (tokenId, exchangeTokenAmount, exchangeTokenAddress, setGrant, setEvents) => {
    const provider = new ethers.providers.Web3Provider(window?.ethereum) //or should this be passed in?
    const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, provider); // should be provider.getSigner() ?

    const submitToastEvent = () => {
        toast({
            title: 'Redemption Submitted',
            description:
                'A notice will appear here after the redemption has been successfully processed. Refer to your wallet for the latest status.',
            status: 'info',
            position: 'top',
            duration: 10000,
            isClosable: true,
        })
    }

    const errorToastEvent = (error) => {
        toast({
            title: 'Error',
            description: parseErrorMessage(error),
            status: 'error',
            position: 'top',
            isClosable: true,
        })
    }

    provider.once("block", () => { // Unsure about this wrapping? Originally added to prevent redemptions from old blocks rendering.
        vesterContract.once('Redemption', async (redeemedTokenId, address, amount) => {
            if (tokenId.toNumber() == redeemedTokenId.toNumber()) {
                toast({
                    title: 'Redemption Successful',
                    description: `You have redeemed ${(amount / 10 ** 18).toLocaleString()} SNX.`,
                    status: 'success',
                    position: 'top',
                    duration: 10000,
                    isClosable: true,
                })
            }
            await fetchGrant(setGrant, tokenId)
            await fetchEvents(setEvents, tokenId)
        })
    })

    if (exchangeTokenAmount) {
        const exchangeTokenAmountParsed = ethers.utils.parseEther(exchangeTokenAmount.toString())
        const exchangeTokenAddressParsed = ethers.utils.getAddress(exchangeTokenAddress)

        const erc20Contract = new ethers.Contract(exchangeTokenAddressParsed, erc20Abi.abi, provider); // should be provider.getSigner() ?
        return await erc20Contract.connect(provider.getSigner()).approve(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, exchangeTokenAmountParsed).then(async () => {
            return await vesterContract.connect(provider.getSigner()).redeemWithTransfer(tokenId, exchangeTokenAddressParsed, exchangeTokenAmountParsed)
                .then(submitToastEvent)
                .catch(errorToastEvent)
        })
    } else {
        return await vesterContract.connect(provider.getSigner()).redeem(tokenId)
            .then(submitToastEvent)
            .catch(errorToastEvent)
    }
}