import { useWallet } from 'use-wallet'
import { Text } from '@chakra-ui/react'
import UserGrants from '../components/Home/UserGrants'

export default function Home() {
  const wallet = useWallet()

  return (
    <div>
      <main>
        {wallet.status === 'connected' ? (
          <UserGrants />
        ) : (
          <Text textAlign="center" py={16} fontWeight="thin" fontSize="3xl" letterSpacing={1.5}>Connect your wallet to view your grants and redeem available tokens.</Text>
        )}
      </main>
    </div >
  )
}
