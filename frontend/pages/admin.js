import { Text } from '@chakra-ui/react'
import AdminPanel from '../components/Admin/AdminPanel'
import { useAccount } from 'wagmi'

export default function Admin() {
  const { isSuccess } = useAccount()

  return (
    <div>
      <main>
        {isSuccess ? (
          <AdminPanel />
        ) : (
          <Text textAlign="center" py={16} fontWeight="thin" fontSize="3xl" letterSpacing={1.5}>Connect your wallet to manage grants.</Text>
        )}
      </main>
    </div >
  )
}
