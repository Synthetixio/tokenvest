import { Heading, Progress, Flex, Box, Text, LightMode } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsClockHistory } from 'react-icons/bs'
import { ethers } from 'ethers'
import { useRecoilState } from 'recoil'
import { format, formatDistanceToNowStrict, formatDistance } from 'date-fns'
import { getGrant } from '../../../lib/store/grants'

export default function GrantStatus({ tokenId, cancelled }) {
  const [grant] = useRecoilState(getGrant(tokenId));

  const amountVested = parseFloat(ethers.utils.formatUnits(grant.amountVested, 18));
  const totalAmount = parseFloat(ethers.utils.formatUnits(grant.totalAmount, 18));
  const vestAmount = parseFloat(ethers.utils.formatUnits(grant.vestAmount, 18));
  const startTimestamp = parseInt(grant.startTimestamp);
  const cliffTimestamp = parseInt(grant.cliffTimestamp);
  const vestInterval = parseInt(grant.vestInterval);

  const currentTime = new Date().getTime() / 1000;
  let nextIntervalVest = 0;
  if (vestInterval > 0 && startTimestamp < currentTime) {
    nextIntervalVest = startTimestamp;
    while (nextIntervalVest < currentTime) {
      nextIntervalVest += vestInterval;
    }
  }

  const nextVest = formatDistanceToNowStrict(
    new Date(Math.max(
      cliffTimestamp * 1000,
      nextIntervalVest * 1000
    ))
  );

  const intervalInWords = formatDistance(new Date(0), new Date(vestInterval * 1000))

  const descriptionText = <div>{
    cliffTimestamp > Date.now() / 1000 ?
      <>Your grant will vest {vestAmount.toLocaleString()} {grant.tokenSymbol} every {intervalInWords} starting {format(new Date(startTimestamp * 1000), 'M/dd/yyyy')} with a cliff on {format(new Date(cliffTimestamp * 1000), 'M/dd/yyyy')}.</>
      :
      amountVested == totalAmount ?
        <Text>Your grant has completely vested.</Text>
        :
        <Text>Your grant vests every {intervalInWords}. Your next {vestAmount.toLocaleString()} {grant.tokenSymbol} will vest in {nextVest}.</Text>
  } </div>

  return (
    <Box
      mb={5}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsClockHistory} boxSize={5} mr={2} />Grant Status</Heading>
      <Flex align="center">
        <Box width="55%" pr={4}>
          {!cancelled ? descriptionText : <Text>Cancelled.</Text>}
        </Box>
        <Box width="45%">
          <Heading size="md" fontWeight="medium" mb={1}>{(amountVested / totalAmount * 100).toLocaleString()}% Vested</Heading>
          <LightMode>
            <Progress colorScheme='green' size='sm' background="gray.700" borderRadius={8} value={amountVested / totalAmount * 100} />
          </LightMode>
          <Text opacity={0.8} fontSize="sm">{amountVested && amountVested.toLocaleString()} {grant.tokenSymbol} of {totalAmount && totalAmount.toLocaleString()} {grant.tokenSymbol}</Text>
        </Box>
      </Flex>
    </Box>
  )
}
