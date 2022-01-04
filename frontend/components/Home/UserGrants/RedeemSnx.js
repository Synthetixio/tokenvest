import { useState } from 'react';
import { Heading, Input, Button, FormControl, FormHelperText, Flex, Box, FormLabel, Text, Spinner } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsCash } from 'react-icons/bs'
import { ethers } from 'ethers'
import { useRecoilState } from 'recoil'
import { getGrant, redeemGrant } from '../../../lib/store/grants'
import { getEventsByTokenId } from '../../../lib/store/events'

export default function ReedemSnx({ tokenId }) {
  const [grant, setGrant] = useRecoilState(getGrant(tokenId));
  const [events, setEvents] = useRecoilState(getEventsByTokenId(tokenId));

  const [loadingRedemption, setLoadingRedemption] = useState(false);

  const vested = parseFloat(ethers.utils.formatUnits(grant.amountVested, 18))
  const redeemed = parseFloat(ethers.utils.formatUnits(grant.amountRedeemed, 18));
  const available = parseFloat(ethers.utils.formatUnits(grant.amountAvailable, 18));

  const redeem = () => {
    setLoadingRedemption(true)
    redeemGrant(grant.tokenId, setGrant, setEvents)
      .finally(() => {
        setLoadingRedemption(false)
      })
  }

  return (
    <Box
      mb={5}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsCash} boxSize={5} mr={2} />Redeem SNX</Heading>

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
    </Box>
  )
}

