import { useState } from 'react';
import { Link, Text } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsInfoCircle } from 'react-icons/bs'
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
    <Text my={6} fontSize="lg"><Icon as={BsInfoCircle} boxSize={4} mr="0.5" transform="translateY(1.5px)" /> You have multiple grants available for redemption. <Link onClick={redeem} disabled={loadingRedemption}
      borderBottom="1px rgba(255,255,255,0.66) dotted"
      borderRadius={1}
      fontWeight="600"
      _hover={{
        textDecoration: "none",
        borderBottom: "1px rgba(255,255,255,0.9) dotted"
      }}>Redeem all</Link></Text >
  )
}

