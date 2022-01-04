import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Box, Text, Spinner, Link } from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import GrantStatus from './GrantStatus'
import RedeemSnx from './RedeemSnx'
import RecentActivity from './RecentActivity'
import { useRecoilState } from 'recoil'
import { grantsStateByUser, getGrants } from '../../../lib/store/grants'
import { eventsState, getEvents } from '../../../lib/store/events'

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
      <Text fontSize="sm" my={6}><InfoOutlineIcon style={{ transform: 'translateY(-1px)' }} mr={1} /> Each grant is an NFT at the contract address <Link
        d="inline"
        borderBottom="1px rgba(255,255,255,0.66) dotted"
        borderRadius={1}
        _hover={{
          textDecoration: "none",
          borderBottom: "1px rgba(255,255,255,0.9) dotted",
        }} href={`https://etherscan.io/token/${process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS}`} isExternal>{process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS}</Link></Text>
    </Box>)
  })

}
