import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Text, Link, Spinner } from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import Grants from './Grants'
import TokenBalance from './TokenBalance'
import RecentActivity from '../../shared/RecentActivity'
import { useRecoilState } from 'recoil'
import { grantsState, fetchGrants } from '../../../lib/store/grants'
import { eventsState, fetchEvents } from '../../../lib/store/events'

export default function AdminPanel() {
  const wallet = useWallet()

  const [grants, setGrant] = useRecoilState(grantsState);
  const [events, setEvents] = useRecoilState(eventsState);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([fetchEvents(setEvents), fetchGrants(setGrant)]).finally(() => {
      setLoadingData(false)
    })
  }, [])

  return loadingData ? <Spinner d="block" mx="auto" my={6} /> : <>
    <Grants />
    <TokenBalance />
    <RecentActivity />
    <Text fontSize="sm" my={6}><InfoOutlineIcon style={{ transform: 'translateY(-1px)' }} mr={1} /> Actions are queued to a Gnosis Safe at <Link
      d="inline"
      borderBottom="1px rgba(255,255,255,0.66) dotted"
      borderRadius={1}
      _hover={{
        textDecoration: "none",
        borderBottom: "1px rgba(255,255,255,0.9) dotted",
      }} href={`https://etherscan.io/address/${process.env.NEXT_PUBLIC_MULTISIG_ADDRESS}`} isExternal>{process.env.NEXT_PUBLIC_MULTISIG_ADDRESS}</Link></Text>
  </>


}
