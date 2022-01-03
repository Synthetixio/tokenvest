import { atom, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import { useWallet } from 'use-wallet'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'

const wallet = useWallet()
const provider = new ethers.providers.Web3Provider(wallet.ethereum)
const vesterContract = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", vesterAbi.abi, provider.getSigner());

// These should all be promises

// getEvents
// getAllEvents
