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
