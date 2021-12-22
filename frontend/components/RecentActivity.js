import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Heading, Flex, Box, Text, Link } from '@chakra-ui/react'
import { CalendarIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import vesterAbi from '../../artifacts/contracts/Vester.sol/Vester.json'
import { format, formatDistanceToNow } from 'date-fns'

export default function RecentActivity() {
  const [events, setEvents] = useState([])

  const wallet = useWallet()
  const provider = new ethers.providers.Web3Provider(wallet.ethereum)
  const vesterContract = new ethers.Contract("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", vesterAbi.abi, provider.getSigner());

  useEffect(async () => {
    let newEvents = []

    const redemptionsFilter = vesterContract.filters.Redemption(wallet.account);
    const redemptionsEvents = await vesterContract.queryFilter(redemptionsFilter, 0, "latest");
    for (const log of redemptionsEvents) {
      newEvents.push({
        type: "Redemption",
        blockNumber: log.blockNumber,
        timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
        amount: log.args.amount
      })
    }

    const grantUpdateFilter = vesterContract.filters.GrantUpdate(wallet.account);
    const grantUpdateEvents = await vesterContract.queryFilter(grantUpdateFilter, 0, "latest");
    for (const log of grantUpdateEvents) {
      newEvents.push({
        type: "Grant Update",
        blockNumber: log.blockNumber,
        timestamp: (await provider.getBlock(log.blockNumber)).timestamp,
        startTimestamp: log.args.startTimestamp,
        cliffTimestamp: log.args.cliffTimestamp,
        quarterlyAmount: log.args.quarterlyAmount,
        totalAmount: log.args.totalAmount,
        amountRedeemed: log.args.amountRedeemed
      })
    }

    newEvents = newEvents.sort((a, b) => (b.blockNumber - a.blockNumber))
    setEvents(newEvents);
  }, [])


  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg"><CalendarIcon transform="translateY(-2px)" boxSize={5} mr={1} /> Recent Activity</Heading>
      {events.map((event, ind) => {
        return (<Flex align="center" borderBottom={ind + 1 != events.length && "1px solid rgba(0,0,0,0.33)"} py={4}>
          <Box pr={8}>
            <Link
              borderBottom="1px rgba(255,255,255,0.66) dotted"
              borderRadius={1}
              _hover={{
                textDecoration: "none",
                borderBottom: "1px rgba(255,255,255,0.9) dotted",
              }} href={"https://etherscan.io/block/" + event.blockNumber} isExternal>Block {event.blockNumber}</Link>
            <Text mt={0.5} fontSize="xs">{formatDistanceToNow(new Date(event.timestamp * 1000))} ago</Text>
          </Box>
          <Box>
            <Heading size="md" fontWeight="medium">{event.type}</Heading>
            {event.type == "Redemption" && <Text mt={0.5}>{parseFloat(ethers.utils.formatUnits(event.amount, 18)).toLocaleString()} SNX redeemed.</Text>}
            {event.type == "Grant Update" && <Flex mt={2}>
              <Box pr={4}>
                <Text fontSize='xs' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Start</Text>
                <Text fontSize="sm">{format(new Date(event.startTimestamp.toNumber() * 1000), 'M/d/yy')}</Text>
                <Text fontSize="xs" opacity={0.8}>{format(new Date(event.cliffTimestamp.toNumber() * 1000), 'M/d/yy')} Cliff</Text>
              </Box>
              <Box pr={4}>
                <Text fontSize='xs' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Vest per qtr.</Text>
                <Text fontSize="sm">{parseInt(ethers.utils.formatUnits(event.quarterlyAmount, 18)).toLocaleString()} SNX</Text>
              </Box>
              <Box pr={4}>
                <Text fontSize='xs' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Total</Text>
                <Text fontSize="sm">{parseInt(ethers.utils.formatUnits(event.totalAmount, 18)).toLocaleString()} SNX</Text>
              </Box>
              <Box>
                <Text fontSize='xs' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Redeemed</Text>
                <Text fontSize="sm">{parseInt(ethers.utils.formatUnits(event.amountRedeemed, 18)).toLocaleString()} SNX</Text>
              </Box>
            </Flex>}
          </Box>
        </Flex>)

      })}

    </Box >
  )
}