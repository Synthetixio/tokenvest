import { Heading, Progress, Flex, Box, Text } from '@chakra-ui/react'
import { InfoOutlineIcon, WarningTwoIcon } from '@chakra-ui/icons'

export default function GrantStatus() {
  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg"><InfoOutlineIcon transform="translateY(-2px)" boxSize={5} mr={1} /> Grant Status</Heading>
      <Flex align="center">
        <Box width="60%" pr={4}>
          <Text>Your grant vests quarterly. Your next 2,300 SNX will vest in 43 days.</Text>
        </Box>
        <Box width="40%">
          <Heading size="md" fontWeight="medium" mb={1}>XX% Vested</Heading>
          <Progress colorScheme='green' size='sm' borderRadius={8} value={20} />
          <Text opacity={0.8} fontSize="sm">4,123 SNX of 10,000 SNX</Text>
        </Box>
      </Flex>
      <Box mt={3}>
        <Text textTransform="uppercase" fontSize="sm" fontWeight="semibold" letterSpacing={1}><WarningTwoIcon transform="translateY(-1px)" />  You cannot redeem until your cliff passes on MM/DD/YY.</Text>
      </Box>
    </Box>
  )
}
