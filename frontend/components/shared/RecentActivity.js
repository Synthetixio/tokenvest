import { Heading, Flex, Box, Text, Link, Spacer } from '@chakra-ui/react'
import { Icon, TimeIcon } from '@chakra-ui/icons'
import { BsCalendarWeek, BsAward, BsSquare } from 'react-icons/bs'
import { ethers } from 'ethers'
import { format, formatDistanceToNow, formatDistance } from 'date-fns'
import { useRecoilState } from 'recoil'
import { getEventsByTokenId, getEvents } from '../../lib/store/events'

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
          <Flex w="100%" mb={3}>
            <Heading d="inline" size="md" fontWeight="medium">
              {event.type}
            </Heading>
            <Box ml="auto" transform="translateY(-2px)">
              {tokenId == undefined &&
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
                <Link
                  borderBottom="1px rgba(255,255,255,0.66) dotted"
                  borderRadius={1}
                  _hover={{
                    textDecoration: "none",
                    borderBottom: "1px rgba(255,255,255,0.9) dotted",
                  }} href={`https://etherscan.io/tx/${event.transactionHash}#eventlog`} isExternal>Block {event.blockNumber.toLocaleString()}</Link>
              </Box>
              <Text d="inline-block" fontSize="xs"><TimeIcon transform="translateY(-1px)" mr={0.5} /> {formatDistanceToNow(new Date(event.timestamp * 1000))} ago</Text>
            </Box>
          </Flex>

          {event.type == "Redemption" && <Text fontSize="lg" mt={-1.5}>{parseFloat(ethers.utils.formatUnits(event.amount, 18)).toLocaleString()} {event.tokenSymbol} redeemed by {event.redeemerAddress}.</Text>}
          {event.type == "Grant Cancelled" && <Flex>
            <Box>
              <Text fontSize='xs' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8} mb={0.5}>Cancelled tokenId</Text>
              <Text>{parseInt(event.tokenId.toNumber())}</Text>
            </Box>
          </Flex>}

        </Box>)
      }) : (<Text textAlign="center" mt={6} pb={6}>
        No activity found for this grant.
      </Text>)}
    </Box >
  )
}
