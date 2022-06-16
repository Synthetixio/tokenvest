import { useState, useEffect } from 'react'
import { Box, Text, Spinner, Link } from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import GrantStatus from './GrantStatus'
import RedeemTokens from './RedeemTokens'
import RedeemAll from './RedeemAll'
import RecentActivity from '../../shared/RecentActivity'
import EtherscanLink from '../../shared/EtherscanLink'
import { useRecoilState } from 'recoil'
import { getGrantsByUser, fetchGrants } from '../../../lib/store/grants'
import { eventsState, fetchEvents } from '../../../lib/store/events'
import { useAccount } from 'wagmi'

export default function UserGrants() {
  const { data } = useAccount()

  const [grants, setGrant] = useRecoilState(getGrantsByUser(data?.address));
  const [events, setEvents] = useRecoilState(eventsState);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([fetchEvents(setEvents), fetchGrants(setGrant)]).finally(() => {
      setLoadingData(false)
    })
  }, [])

  const makeGrantElement = (grant, ind) => {
    return (<Box key={ind} mb={12}>
      <Text fontSize='xs' fontWeight="semibold" lineHeight={1} textTransform="uppercase" letterSpacing={1} mb={4}>Grant #{grant.tokenId}</Text>
      <GrantStatus tokenId={grant.tokenId} cancelled={grant.cancelled} />
      {grant.cancelled ? "" : <RedeemTokens tokenId={grant.tokenId} />}
      <RecentActivity tokenId={grant.tokenId} />
      <Text fontSize="sm" my={6}><InfoOutlineIcon style={{ transform: 'translateY(-1px)' }} mr={1} /> Each grant is an NFT at the contract address <EtherscanLink
        d="inline"
        borderBottom="1px rgba(255,255,255,0.66) dotted"
        borderRadius={1}
        _hover={{
          textDecoration: "none",
          borderBottom: "1px rgba(255,255,255,0.9) dotted",
        }} path={`/token/${process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS}`} isExternal>{process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS}</EtherscanLink></Text>
    </Box>)
  }

  const noGrantsText = <Text textAlign="center" py={16} fontWeight="thin" fontSize="3xl" letterSpacing={1.5}>There are no grants associated with this wallet.</Text>

  const numNonZeroAvailable = grants.length ? grants.filter(g => g.amountAvailable.gt(0)).length : 0;

  return loadingData ? <Spinner d="block" mx="auto" my={6} /> :
    (grants.length ? <div>
      {numNonZeroAvailable > 1 ? <RedeemAll /> : ""}
      {[...grants].reverse().map(makeGrantElement)}
    </div> : noGrantsText)

}
