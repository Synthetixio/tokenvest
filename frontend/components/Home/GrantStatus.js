import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Heading, Progress, Flex, Box, Text, Spinner } from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'
import { format, formatDistanceToNowStrict } from 'date-fns'

export default function GrantStatus() {
  const [loadingData, setLoadingData] = useState(true);
  const [vested, setVested] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [quarterlyAmount, setQuarterlyAmount] = useState(0);
  const [startTimestamp, setStartTimestamp] = useState(0);
  const [cliffTimestamp, setCliffTimestamp] = useState(0);

  const wallet = useWallet()
  const provider = new ethers.providers.Web3Provider(wallet.ethereum)
  const vesterContract = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", vesterAbi.abi, provider.getSigner());

  useEffect(() => {
    loadData();
  }, [])

  const loadData = async () => {
    const vested = await vesterContract.amountVested(wallet.account)
    setVested(parseFloat(ethers.utils.formatUnits(vested, 18)))

    const grantData = await vesterContract.grants(wallet.account)
    setTotalAmount(parseFloat(ethers.utils.formatUnits(grantData.totalAmount, 18)))
    setQuarterlyAmount(parseFloat(ethers.utils.formatUnits(grantData.quarterlyAmount, 18)))
    setStartTimestamp(parseInt(grantData.startTimestamp))
    setCliffTimestamp(parseInt(grantData.cliffTimestamp))

    Promise.all([vested, grantData]).then(setLoadingData(false))
  }

  let nextQuarter = startTimestamp
  while (nextQuarter < Date.now() / 1000) {
    nextQuarter += 7889400
  }
  const nextVest = formatDistanceToNowStrict(
    new Date(Math.max(
      cliffTimestamp * 1000,
      nextQuarter * 1000
    ))
  );

  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" mb={1}><InfoOutlineIcon transform="translateY(-2px)" boxSize={5} mr={1} /> Grant Status</Heading>
      {loadingData ?
        <Spinner d="block" mx="auto" mt={12} mb={8} /> :
        <>
          <Flex align="center">
            <Box width="50%" pr={4}>
              {cliffTimestamp > Date.now() / 1000 ?
                <>Your grant will vest {quarterlyAmount.toLocaleString()} SNX each quarter with a cliff on {format(new Date(cliffTimestamp * 1000), 'M/dd/yyyy')}.</>
                :
                vested == totalAmount ?
                  <Text>Your grant has completely vested.</Text>
                  :
                  <Text>Your grant vests quarterly. Your next {quarterlyAmount.toLocaleString()} SNX will vest in {nextVest}.</Text>
              }
            </Box>
            <Box width="50%">
              <Heading size="md" fontWeight="medium" mb={1}>{(vested / totalAmount * 100).toLocaleString()}% Vested</Heading>
              <Progress colorScheme='green' size='sm' borderRadius={8} value={vested / totalAmount * 100} />
              <Text opacity={0.8} fontSize="sm">{vested.toLocaleString()} SNX of {totalAmount.toLocaleString()} SNX</Text>
            </Box>
          </Flex>
        </>
      }
    </Box>
  )
}
