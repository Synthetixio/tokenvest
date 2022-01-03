import { atom, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'
import { parseErrorMessage } from '../../lib/utils/helpers'
import { createStandaloneToast } from '@chakra-ui/react'
import theme from '../../styles/theme'

const toast = createStandaloneToast({ theme })

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
    const vesterContract = new ethers.Contract("0x68B1D87F95878fE05B998F19b66F4baba5De1aed", vesterAbi.abi, provider); // should be provider.getSigner() ?

    const grantData = await vesterContract.grants(address)
    const amountVested = await vesterContract.amountVested(address)
    const amountAvailable = await vesterContract.availableForRedemption(address)

    setGrant({
        amountVested,
        amountAvailable,
        ...grantData
    })

    return Promise.all([grantData, amountVested, amountAvailable])
}

export const getGrants = async (setGrant) => {
    let addresses = []
    let promises = []

    // Get all addresses with grants based on events
    const grantUpdateFilter = vesterContract.filters.GrantUpdate();
    const grantUpdateEvents = await vesterContract.queryFilter(grantUpdateFilter, 0, "latest");
    for (const log of grantUpdateEvents) {
        const address = log.args.granteeAddress
        if (!addresses.includes(address)) {
            promises.push(await getGrant(setGrant, address))
            addresses.push(address)
        }
    }

    return Promise.all(promises)
}

export const redeemGrant = async (provider, address, setGrant) => {
    const vesterContract = new ethers.Contract("0x68B1D87F95878fE05B998F19b66F4baba5De1aed", vesterAbi.abi, provider); // should be provider.getSigner() ?

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

    // TODO: is this working properly?
    provider.once("block", () => { // only trigger on new blocks
        vesterContract.once('Redemption', async (sender, amount) => {
            if (address == sender) {
                toast({
                    title: 'Redemption Successful',
                    description: `You have redeemed ${(amount / 10 ** 18).toLocaleString()} SNX.`,
                    status: 'success',
                    position: 'top',
                    duration: 10000,
                    isClosable: true,
                })
            }
            await getGrant(setGrant, address)
            // TODO: Reload events here
        })
    })

    return await vesterContract.connect(provider.getSigner()).redeem()
        .then(submitToastEvent)
        .catch(errorToastEvent)
}