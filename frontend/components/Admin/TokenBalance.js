import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Heading, Flex, Box, Text, Link, Spinner, Spacer } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsCashStack } from 'react-icons/bs'
import { ethers } from 'ethers'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'
import { format, formatDistanceToNow } from 'date-fns'

export default function Events() {
  const [loadingData, setLoadingData] = useState(true);
  const [events, setEvents] = useState([])

  const wallet = useWallet()
  const provider = new ethers.providers.Web3Provider(wallet.ethereum)
  const vesterContract = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", vesterAbi.abi, provider.getSigner());

  useEffect(async () => {
    setLoadingData(false);
  }, [])

  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsCashStack} boxSize={5} mr={2} />Token Balance</Heading>
      {loadingData ?
        <Spinner d="block" mx="auto" mt={12} mb={8} /> :
        <>
          Token Balance, withdraw current amount
        </>
      }

    </Box >
  )
}
