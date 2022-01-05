import { Heading, Box, Table, Thead, Tbody, Tr, Th, Td, Link, Button, Text, Flex, useDisclosure } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import { format, formatDistance } from 'date-fns'
import { BsAward } from 'react-icons/bs'
import { accountDisplay } from '../../../../lib/utils/helpers'
import { useRecoilState } from 'recoil'
import { getGrants } from '../../../../lib/store/grants'
import GrantModal from './GrantModal'
import BurnButton from './BurnButton'

export default function Grants() {
  const [grants, setGrants] = useRecoilState(getGrants());

  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Flex w="100%" align="center" mb={4}>
        <Heading d="inline-block" size="lg" fontWeight="light"><Icon as={BsAward} boxSize={5} mr={2} />Grants</Heading>
        <GrantModal />
      </Flex>
      <Table variant='simple' size='sm'>
        <Thead>
          <Tr>
            <Th />
            <Th>Owner</Th>
            <Th>Schedule</Th>
            <Th>Vesting</Th>
            <Th>Amount</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {grants.map((grant, ind) => {
            return (
              <Tr key={ind}>
                <Td>#{grant.tokenId.toNumber()}</Td>
                <Td>
                  <Link
                    borderBottom="1px rgba(255,255,255,0.66) dotted"
                    borderRadius={1}
                    lineHeight={1.2}
                    _hover={{
                      textDecoration: "none",
                      borderBottom: "1px rgba(255,255,255,0.9) dotted",
                    }} isExternal href={`https://etherscan.io/address/${grant.owner}`}>{accountDisplay(grant.owner)}</Link>
                </Td>
                <Td>
                  <Text>{format(new Date(grant.startTimestamp.toNumber() * 1000), 'M/d/yy')} start</Text>
                  <Text fontSize="xs" opacity={0.8}>{format(new Date(grant.cliffTimestamp.toNumber() * 1000), 'M/d/yy')} cliff</Text>
                </Td>
                <Td>
                  <Text>{parseInt(ethers.utils.formatUnits(grant.vestAmount, 18)).toLocaleString()} SNX</Text>
                  <Text fontSize="xs" opacity={0.8}>every {formatDistance(new Date(0), new Date(grant.vestInterval * 1000))}</Text>
                </Td>
                <Td>
                  <Text>{parseInt(ethers.utils.formatUnits(grant.amountRedeemed, 18)).toLocaleString()} SNX redeemed</Text>
                  <Text fontSize="xs" opacity={0.8}>of {parseInt(ethers.utils.formatUnits(grant.totalAmount, 18)).toLocaleString()} SNX total</Text>
                </Td>
                <Td>
                  <GrantModal tokenId={grant.tokenId} />
                  <BurnButton tokenId={grant.tokenId} />
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Box >
  )
}
