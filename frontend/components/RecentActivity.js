import { Heading, Flex, Box, Text } from '@chakra-ui/react'
import { CalendarIcon } from '@chakra-ui/icons'

export default function RecentActivity() {
  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg"><CalendarIcon transform="translateY(-2px)" boxSize={5} mr={1} /> Recent Activity</Heading>
      <Flex align="center" borderBottom="1px solid black" py={4}>
        <Box pr={8}>Timestamp
          <Text fontSize="xs">Relative time</Text></Box>
        <Box>
          <Heading size="md" fontWeight="medium">Redemption</Heading>
          <Text>Details here.</Text></Box>
      </Flex>
      <Flex align="center" borderBottom="1px solid black" py={4}>
        <Box pr={8}>Timestamp
          <Text fontSize="xs">Relative time</Text></Box>
        <Box>
          <Heading size="md" fontWeight="medium">Grant Update</Heading>
          <Text>Details here.</Text></Box>
      </Flex>
    </Box>
  )
}
