import { useState } from 'react'
import { Heading, Box, Table, Thead, Tbody, Tr, Th, Td, Link, Text, Flex, Checkbox } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import { format, formatDistance } from 'date-fns'
import { BsAward } from 'react-icons/bs'
import { accountDisplay } from '../../../../lib/utils/helpers'
import { useRecoilState } from 'recoil'
import { getGrants } from '../../../../lib/store/grants'
import EtherscanLink from '../../../shared/EtherscanLink'
import GrantModal from './GrantModal'
import CancelButton from './CancelButton'

export default function Grants() {
  const [grants, setGrants] = useRecoilState(getGrants());
  const [showCancelled, setShowCancelled] = useState(false)

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
            <Th>Grantee</Th>
            <Th>Schedule</Th>
            <Th>Vesting</Th>
            <Th>Amount</Th>
            <Th />
          </Tr>
        </Thead>
        <Tbody>
          {grants.map((grant, ind) => {
            return (
              <Tr key={ind} d={!showCancelled && grant.cancelled && 'none'}>
                <Td>#{grant.tokenId}</Td>
                <Td>
                  <EtherscanLink
                    borderBottom="1px rgba(255,255,255,0.66) dotted"
                    borderRadius={1}
                    lineHeight={1.2}
                    _hover={{
                      textDecoration: "none",
                      borderBottom: "1px rgba(255,255,255,0.9) dotted",
                    }} isExternal path={`/address/${grant.owner}`}>{accountDisplay(grant.owner)}</EtherscanLink>
                </Td>
                <Td>
                  <Text>{format(new Date(grant.startTimestamp.toNumber() * 1000), 'MMM. d ’yy')} start</Text>
                  <Text fontSize="xs" opacity={0.8}> {format(new Date(grant.cliffTimestamp.toNumber() * 1000), 'MMM. d ’yy')} cliff</Text>
                </Td>
                <Td>
                  <Text>{parseInt(ethers.utils.formatUnits(grant.vestAmount, 18)).toLocaleString()} {grant.tokenSymbol}</Text>
                  <Text fontSize="xs" opacity={0.8}>every {formatDistance(new Date(0), new Date(grant.vestInterval * 1000))}</Text>
                </Td>
                <Td>
                  <Text>{parseInt(ethers.utils.formatUnits(grant.amountRedeemed, 18)).toLocaleString()} {grant.tokenSymbol} redeemed</Text>
                  <Text fontSize="xs" opacity={0.8}>of {parseInt(ethers.utils.formatUnits(grant.totalAmount, 18)).toLocaleString()} {grant.tokenSymbol} total</Text>
                </Td>
                <Td>
                  {grant.cancelled ? <Text fontSize="xs" opacity={0.8}>Cancelled</Text> :
                    <div>
                      <GrantModal grant={grant} />
                      <CancelButton tokenId={grant.tokenId} />
                    </div>
                  }
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
      <Checkbox
        mt="3"
        isChecked={showCancelled}
        onChange={(e) => setShowCancelled(!showCancelled)}>Show cancelled grants</Checkbox>
    </Box >
  )
}
