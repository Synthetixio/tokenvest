import { useWallet } from 'use-wallet'
import { Button } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'

export default function WalletConnector() {
  const wallet = useWallet()

  function accountDisplay(address) {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4)
  }

  const CircleIcon = (
    <Icon viewBox='0 0 200 200' color='green.500'>
      <path
        fill='currentColor'
        d='M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
      />
    </Icon>
  )

  return wallet.status === 'connected' ? (
    <>
      <Button key={1} leftIcon={CircleIcon} mr={4} pointerEvents="none" background="blackAlpha.400"> {accountDisplay(wallet.account)}</Button>
      <Button key={2} onClick={() => wallet.reset()}>Disconnect</Button>
    </>
  ) : (
    <Button key={3} onClick={() => wallet.connect()}>Connect Wallet</Button>
  )
}
