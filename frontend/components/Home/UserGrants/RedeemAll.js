import { useState } from 'react';
import { Heading, Button, Box, LightMode } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsCash } from 'react-icons/bs'
import { redeemAll } from '../../../lib/store/grants'

export default function RedeemAll() {
  const [loadingRedemption, setLoadingRedemption] = useState(false);

  const redeem = () => {
    setLoadingRedemption(true)
    redeemAll()
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
      <Heading size="lg" fontWeight="light"><Icon as={BsCash} boxSize={5} mr={2} />Redeem all available grants</Heading>
      <Box py={4} px={3}>
        <LightMode>
          <Button onClick={redeem} isLoading={loadingRedemption} isFullWidth size="lg" colorScheme="blue">Redeem All Grants</Button>
        </LightMode>
      </Box>
    </Box>
  )
}

