import { useState, useEffect } from 'react';
import { useWallet } from 'use-wallet'
import { Heading, Input, Button, FormControl, FormHelperText, Flex, Box, FormLabel, Text, Spinner } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsCash } from 'react-icons/bs'
import { ethers } from 'ethers'
import { useRecoilState } from 'recoil'
import { grantState, getGrant, redeemGrant } from '../../lib/store/grants'

export default function ReedemSnx() {
  const wallet = useWallet()
  const provider = new ethers.providers.Web3Provider(wallet.ethereum)
  const [grant, setGrant] = useRecoilState(grantState(wallet.account));
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRedemption, setLoadingRedemption] = useState(false);

  useEffect(() => {
    getGrant(setGrant, wallet.account).then(() => {
      setLoadingData(false)
    })
  }, [])

  if (!loadingData) {
    const vested = parseFloat(ethers.utils.formatUnits(grant.amountVested, 18))
    const redeemed = parseFloat(ethers.utils.formatUnits(grant.amountRedeemed, 18));
    const available = parseFloat(ethers.utils.formatUnits(grant.amountAvailable, 18));
  }

  const redeem = () => {
    setLoadingRedemption(true)
    redeemGrant(provider, wallet.account, setGrant)
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

