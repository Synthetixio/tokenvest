import { useWallet } from 'use-wallet'
import { Text } from '@chakra-ui/react'
import Grants from '../components/Admin/Grants'
import Events from '../components/Admin/Events'

export default function Admin() {
  const wallet = useWallet()

  return (
    <div>
      <main>
        {wallet.status === 'connected' ? (
          <>
            <Grants />
            <Events />
          </>
        ) : (
          <Text textAlign="center" py={16} fontWeight="thin" fontSize="3xl" letterSpacing={1.5}>Connect your wallet to manage grants.</Text>
        )}
      </main>
    </div >
  )
}
