import { Text } from '@chakra-ui/react'
import AdminPanel from '../components/Admin/AdminPanel'
import { useEthers } from '@usedapp/core'

export default function Admin() {
  const { account } = useEthers()
  return (
    <div>
      <main>
        {account ? (
          <AdminPanel />
        ) : (
          <Text textAlign="center" py={16} fontWeight="thin" fontSize="3xl" letterSpacing={1.5}>Connect your wallet to manage grants.</Text>
        )}
      </main>
    </div >
  )
}
