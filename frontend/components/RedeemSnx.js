import { Heading, Input, Button, FormControl, FormHelperText, Flex, Box, FormLabel, Text } from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'

export default function ReedemSnx() {
  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg"><DownloadIcon transform="translateY(-2px)" boxSize={5} mr={1} /> Redeem SNX</Heading>
      <Text mb={1}>You can redeem available SNX tokens. Available tokens do not expire.</Text>
      <Flex mb={6}>
        <Box>
          <Text fontSize='3xl' fontWeight="medium">23,132</Text>
          <Text fontSize='sm' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Vested</Text>
        </Box>
        <Box px={4}>
          <Text fontSize='3xl' fontWeight="medium">-</Text>
        </Box>
        <Box>
          <Text fontSize='3xl' fontWeight="medium">10,324</Text>
          <Text fontSize='sm' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Redeemed</Text>
        </Box>
        <Box px={4}>
          <Text fontSize='3xl' fontWeight="medium">=</Text>
        </Box>
        <Box>
          <Text fontSize='3xl' fontWeight="medium">12,359</Text>
          <Text fontSize='sm' lineHeight={1} textTransform="uppercase" letterSpacing={1.5} opacity={0.8}>Amount Available</Text>
        </Box>
      </Flex>

      <FormControl d="none" mb={4}>
        <FormLabel>Optional Purchase Price</FormLabel>
        <Input placeholder='Enter Amount' />
        <FormHelperText>For tax reasons, you may purchase these tokens rather than receive them at no cost. Consult your own tax council.</FormHelperText>
      </FormControl>

      <Button isFullWidth size="lg" colorScheme="blue">Redeem 12,359 SNX</Button>
    </Box>
  )
}
