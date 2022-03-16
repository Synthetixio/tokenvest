import { Text } from '@chakra-ui/react'
import UserGrants from '../components/Home/UserGrants'
import { useEthers } from '@usedapp/core'

export default function Home() {
  const { account } = useEthers()

  return (
    <div>
      <main>
        {account ? (
          <UserGrants />
        ) : (
          <Text textAlign="center" py={16} fontWeight="thin" fontSize="3xl" letterSpacing={1.5}>Connect your wallet to view your grants and redeem available tokens.</Text>
        )}
      </main>
    </div >
  )
}
