import { useState, useEffect } from 'react'
import { Box, Text, Spinner, Link } from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import GrantStatus from './GrantStatus'
import RedeemTokens from './RedeemTokens'
import RecentActivity from '../../shared/RecentActivity'
import { useRecoilState } from 'recoil'
import { getGrantsByUser, fetchGrants } from '../../../lib/store/grants'
import { eventsState, fetchEvents } from '../../../lib/store/events'
import { useEthers } from '@usedapp/core'

export default function UserGrants() {
  const { account } = useEthers()

  const [grants, setGrant] = useRecoilState(getGrantsByUser(account));
  const [events, setEvents] = useRecoilState(eventsState);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([fetchEvents(setEvents), fetchGrants(setGrant)]).finally(() => {
      setLoadingData(false)
    })
  }, [])

  return loadingData ? <Spinner d="block" mx="auto" my={6} /> :
    (grants.length ? grants.map((grant, ind) => {
      return (<Box key={ind} mb={12}>
        <Text fontSize='xs' fontWeight="semibold" lineHeight={1} textTransform="uppercase" letterSpacing={1} mb={4}>Grant #{grant.tokenId.toNumber()}</Text>
        <GrantStatus tokenId={grant.tokenId.toNumber()} />
        <RedeemTokens tokenId={grant.tokenId.toNumber()} />
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
    }) : <Text textAlign="center" py={16} fontWeight="thin" fontSize="3xl" letterSpacing={1.5}>There are no grants associated with this wallet.</Text>)

}
