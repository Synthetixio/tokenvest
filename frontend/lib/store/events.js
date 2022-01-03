import { atom, selectorFamily } from "recoil";
import { ethers } from 'ethers'
import { useWallet } from 'use-wallet'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'

const wallet = useWallet()
const provider = new ethers.providers.Web3Provider(wallet.ethereum)
const vesterContract = new ethers.Contract("0x68B1D87F95878fE05B998F19b66F4baba5De1aed", vesterAbi.abi, provider.getSigner());

// These should all be promises

// getEvents
// getAllEvents
