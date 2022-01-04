import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Spinner } from '@chakra-ui/react'
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
  </>


}
