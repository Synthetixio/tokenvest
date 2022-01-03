import { atom, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import { useWallet } from 'use-wallet'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'

const wallet = useWallet()
const provider = new ethers.providers.Web3Provider(wallet.ethereum)
const vesterContract = new ethers.Contract("0x610178dA211FEF7D417bC0e6FeD39F05609AD788", vesterAbi.abi, provider.getSigner());

// These should all be promises

// getEvents
// getAllEvents
