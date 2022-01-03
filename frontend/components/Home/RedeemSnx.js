import { useState, useEffect } from 'react';
import { useWallet } from 'use-wallet'
import { Heading, Input, Button, FormControl, FormHelperText, Flex, Box, FormLabel, Text, Spinner, createStandaloneToast } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsCash } from 'react-icons/bs'
import { ethers } from 'ethers'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'
import theme from '../../styles/theme'
import { parseErrorMessage } from '../../lib/utils/helpers'

export default function ReedemSnx() {
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRedemption, setLoadingRedemption] = useState(false);
  const [vested, setVested] = useState(0);
  const [redeemed, setRedeemed] = useState(0);
  const [available, setAvailable] = useState(0);

  const toast = createStandaloneToast({ theme })

  const wallet = useWallet()
  const provider = new ethers.providers.Web3Provider(wallet.ethereum)
  const vesterContract = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", vesterAbi.abi, provider.getSigner());

  useEffect(() => {
    loadData();

    provider.once("block", () => { // only trigger on new blocks
      vesterContract.on('Redemption', async (sender, amount) => {
        if (wallet.account == sender) {
          toast({
            title: 'Redemption Successful',
            description: `You have redeemed ${(amount / 10 ** 18).toLocaleString()} SNX.`,
            status: 'success',
            position: 'top',
            duration: 10000,
            isClosable: true,
          })
        }
        await loadData()
      })
    })
  }, [])

  const loadData = async () => {
    const vested = await vesterContract.amountVested(wallet.account)
    setVested(parseFloat(ethers.utils.formatUnits(vested, 18)))

    const grantData = await vesterContract.grants(wallet.account)
    setRedeemed(parseFloat(ethers.utils.formatUnits(grantData.amountRedeemed, 18)))

    const available = await vesterContract.availableForRedemption(wallet.account)
    setAvailable(parseFloat(ethers.utils.formatUnits(available, 18)))

    Promise.all([vested, grantData, available]).then(setLoadingData(false))
  }

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


  const redeem = () => {
    setLoadingRedemption(true)
    vesterContract.connect(provider.getSigner()).redeem()
      .then(submitToastEvent)
      .catch(errorToastEvent)
      .finally(() => {
        setLoadingRedemption(false)
      })
  }

  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsCash} boxSize={5} mr={2} />Redeem SNX</Heading>

      {loadingData ?
        <Spinner d="block" mx="auto" mt={12} mb={8} /> :
        <>
          <Flex align="center" mb={6}>
            <Box width="50%" pr={4} pt={2}>
              <Text>You can redeem available SNX tokens. Available tokens do not expire.</Text>
            </Box>
            <Box width="50%" pr={4}>
              <Flex>
                <Box>
                  <Text fontSize='2xl' fontWeight="medium">{vested.toLocaleString()}</Text>
                  <Text fontSize='sm' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Vested</Text>
                </Box>
                <Box px={4}>
                  <Text fontSize='2xl' fontWeight="medium">-</Text>
                </Box>
                <Box>
                  <Text fontSize='2xl' fontWeight="medium">{redeemed.toLocaleString()}</Text>
                  <Text fontSize='sm' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Redeemed</Text>
                </Box>
                <Box px={4}>
                  <Text fontSize='2xl' fontWeight="medium">=</Text>
                </Box>
                <Box>
                  <Text fontSize='2xl' fontWeight="medium">{available.toLocaleString()}</Text>
                  <Text fontSize='sm' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Available</Text>
                </Box>
              </Flex>
            </Box>
          </Flex>

          <FormControl d="none" mb={4}>
            <FormLabel>Optional Purchase Price</FormLabel>
            <Input placeholder='Enter Amount' />
            <FormHelperText>For tax reasons, you may purchase these tokens rather than receive them at no cost. Consult your own tax council.</FormHelperText>
          </FormControl>

          <Button onClick={redeem} isLoading={loadingRedemption} isFullWidth size="lg" isDisabled={available == 0} colorScheme="blue">Redeem {available.toLocaleString()} SNX</Button>
        </>
      }
    </Box>
  )
}
