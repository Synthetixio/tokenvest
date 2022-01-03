import { useWallet } from 'use-wallet'
import { Button } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { accountDisplay } from '../lib/utils/helpers'
import { BsCircleFill } from 'react-icons/bs'

export default function WalletConnector() {
  const wallet = useWallet()

  return wallet.status === 'connected' ? (
    <>
      <Button key={1} leftIcon={<Icon as={BsCircleFill} color="green" />} mr={4} pointerEvents="none" background="blackAlpha.400"> {accountDisplay(wallet.account)}</Button>
      <Button key={2} onClick={() => wallet.reset()}>Disconnect</Button>
    </>
  ) : (
    <Button key={3} onClick={() => wallet.connect()}>Connect Wallet</Button>
  )
}
