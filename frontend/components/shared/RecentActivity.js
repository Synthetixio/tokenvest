import { Heading, Flex, Box, Text, Link } from '@chakra-ui/react'
import { Icon, TimeIcon } from '@chakra-ui/icons'
import { BsCalendarWeek, BsAward, BsSquare } from 'react-icons/bs'
import { ethers } from 'ethers'
import { formatDistanceToNow } from 'date-fns'
import { useRecoilState } from 'recoil'
import { getEventsByTokenId, getEvents } from '../../lib/store/events'
import EtherscanLink from './EtherscanLink'

export default function RecentActivity({ tokenId }) {
  const [events] = useRecoilState(tokenId != undefined ? getEventsByTokenId(tokenId) : getEvents);

  return (
    <Box
      mb={4}
      borderRadius="md"
      background="gray.900"
      pt={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsCalendarWeek} boxSize={5} mr={2} />Recent Activity</Heading>
      {events.length ? events.slice().sort((a, b) => (b.blockNumber - a.blockNumber)).map((event, ind) => {
        return (<Box borderBottom={ind + 1 != events.length && "1px solid rgba(255,255,255,0.1)"} py={4} key={ind}>
          <Flex w="100%">
            <Heading d="inline" size="md" fontWeight="medium">
              {event.type}
            </Heading>
            <Box ml="auto" transform="translateY(-2px)">
              {tokenId == undefined && event.tokenId &&
                <Text
                  d="inline-block"
                  mr={4}
                  fontSize="xs"
                  borderRadius={1}
                  lineHeight={1.2}><Icon as={BsAward} mr={0.5} transform="translateY(1px)" /> Grant #{event.tokenId.toNumber()}</Text>
              }
              <Box
                d="inline-block"
                mr={4}
                fontSize="xs">
                <Icon as={BsSquare} mr={0.5} transform="translateY(1.5px)" />&nbsp;
                <EtherscanLink
                  borderBottom="1px rgba(255,255,255,0.66) dotted"
                  borderRadius={1}
                  _hover={{
                    textDecoration: "none",
                    borderBottom: "1px rgba(255,255,255,0.9) dotted",
                  }} path={`/tx/${event.transactionHash}#eventlog`} isExternal>Block {event.blockNumber.toLocaleString()}</EtherscanLink>
              </Box>
              <Text d="inline-block" fontSize="xs"><TimeIcon transform="translateY(-1px)" mr={0.5} /> {formatDistanceToNow(new Date(event.timestamp * 1000))} ago</Text>
            </Box>
          </Flex>

          {event.type == "Redemption" && <Text fontSize="lg" mt={2}>{parseFloat(ethers.utils.formatUnits(event.amount, 18)).toLocaleString()} {event.tokenSymbol} redeemed by {event.redeemerAddress}.</Text>}

        </Box>)
      }) : (<Text textAlign="center" mt={6} pb={6}>
        No activity found for this grant.
      </Text>)}
    </Box >
  )
}
