import { Heading, Progress, Flex, Box, Text } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsClockHistory } from 'react-icons/bs'
import { ethers } from 'ethers'
import { useRecoilState } from 'recoil'
import { format, formatDistanceToNowStrict, formatDistance } from 'date-fns'
import { grantState } from '../../../lib/store/grants'

export default function GrantStatus({ tokenId }) {
  const [grant] = useRecoilState(grantState(tokenId));

  const amountVested = parseFloat(ethers.utils.formatUnits(grant.amountVested, 18));
  const totalAmount = parseFloat(ethers.utils.formatUnits(grant.totalAmount, 18));
  const vestAmount = parseFloat(ethers.utils.formatUnits(grant.vestAmount, 18));
  const startTimestamp = parseInt(grant.startTimestamp);
  const cliffTimestamp = parseInt(grant.cliffTimestamp);
  const vestInterval = parseInt(grant.vestInterval);

  let nextQuarter = startTimestamp
  while (nextQuarter < Date.now() / 1000) {
    nextQuarter += 7889400
  }
  const nextVest = formatDistanceToNowStrict(
    new Date(Math.max(
      cliffTimestamp * 1000,
      nextQuarter * 1000
    ))
  );
  const intervalInWords = formatDistance(new Date(0), new Date(vestInterval * 1000))

  return (
    <Box
      mb={5}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsClockHistory} boxSize={5} mr={2} />Grant Status</Heading>
      <Flex align="center">
        <Box width="50%" pr={4}>
          {cliffTimestamp > Date.now() / 1000 ?
            <>Your grant will vest {vestAmount.toLocaleString()} SNX every {intervalInWords} with a cliff on {format(new Date(cliffTimestamp * 1000), 'M/dd/yyyy')}.</>
            :
            amountVested == totalAmount ?
              <Text>Your grant has completely vested.</Text>
              :
              <Text>Your grant vests every {intervalInWords}. Your next {vestAmount.toLocaleString()} SNX will vest in {nextVest}.</Text>
          }
        </Box>
        <Box width="50%">
          <Heading size="md" fontWeight="medium" mb={1}>{(amountVested / totalAmount * 100).toLocaleString()}% Vested</Heading>
          <Progress colorScheme='green' size='sm' borderRadius={8} value={amountVested / totalAmount * 100} />
          <Text opacity={0.8} fontSize="sm">{amountVested && amountVested.toLocaleString()} SNX of {totalAmount && totalAmount.toLocaleString()} SNX</Text>
        </Box>
      </Flex>
    </Box>
  )
}
