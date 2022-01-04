import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Box, Text, Spinner } from '@chakra-ui/react'
import GrantStatus from './UserGrants/GrantStatus'
import RedeemSnx from './UserGrants/RedeemSnx'
import RecentActivity from './UserGrants/RecentActivity'
import { useRecoilState } from 'recoil'
import { grantsStateByUser, getGrants } from '../../lib/store/grants'
import { eventsState, getEvents } from '../../lib/store/events'

export default function Home() {
  const wallet = useWallet()

  const [grants, setGrant] = useRecoilState(grantsStateByUser(wallet.account));
  const [events, setEvents] = useRecoilState(eventsState);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([getEvents(setEvents), getGrants(setGrant)]).finally(() => {
      setLoadingData(false)
    })
  }, [])

  return loadingData ? <Spinner d="block" mx="auto" my={6} /> : grants.map((grant, ind) => {
    return (<Box key={ind} mb={12}>
      <Text fontSize='xs' fontWeight="semibold" lineHeight={1} textTransform="uppercase" letterSpacing={1} mb={4}>Grant #{grant.tokenId.toNumber()}</Text>
      <GrantStatus tokenId={grant.tokenId.toNumber()} />
      <RedeemSnx tokenId={grant.tokenId.toNumber()} />
      <RecentActivity tokenId={grant.tokenId.toNumber()} />
    </Box>)
  })

}
