import { useState, useEffect } from 'react'
import { useWallet } from 'use-wallet'
import { Heading, Box, Spinner, Table, Thead, Tbody, Tr, Th, Td, Link, Button, Flex } from '@chakra-ui/react'
import { Icon, EditIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import vesterAbi from '../../../artifacts/contracts/Vester.sol/Vester.json'
import { format } from 'date-fns'
import { BsAward } from 'react-icons/bs'
import { accountDisplay } from '../../lib/utils/helpers'

export default function Grants() {
  const [loadingData, setLoadingData] = useState(true);
  const [grants, setGrants] = useState([])

  const wallet = useWallet()
  const provider = new ethers.providers.Web3Provider(wallet.ethereum)
  const vesterContract = new ethers.Contract("0x68B1D87F95878fE05B998F19b66F4baba5De1aed", vesterAbi.abi, provider.getSigner());

  useEffect(async () => {
    let addresses = new Set()

    const redemptionsFilter = vesterContract.filters.Redemption();
    const redemptionsEvents = await vesterContract.queryFilter(redemptionsFilter, 0, "latest");
    for (const log of redemptionsEvents) {
      addresses.add(log.args.redeemerAddress)
    }

    const grantUpdateFilter = vesterContract.filters.GrantUpdate();
    const grantUpdateEvents = await vesterContract.queryFilter(grantUpdateFilter, 0, "latest");
    for (const log of grantUpdateEvents) {
      addresses.add(log.args.granteeAddress)
    }

    let grants = []
    for (const address of addresses) {
      const grantData = await vesterContract.grants(address)
      grants.push(
        {
          address,
          ...grantData
        }
      )
    }

    setGrants(grants);
    setLoadingData(false);
  }, [])

  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Flex w="100%" align="center" mb={4}>
        <Heading d="inline-block" size="lg" fontWeight="light"><Icon as={BsAward} boxSize={5} mr={2} />Grants</Heading>
        <Button ml="auto" colorScheme="green" size="sm">Create Grant</Button>
      </Flex>
      {loadingData ?
        <Spinner d="block" mx="auto" mt={12} mb={8} /> :
        <Table variant='simple' size='sm'>
          <Thead>
            <Tr>
              <Th>Address</Th>
              <Th>Start</Th>
              <Th>Cliff</Th>
              <Th>Vest per qtr.</Th>
              <Th>Total</Th>
              <Th>Redeemed</Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {grants.map(grant => {
              return (
                <Tr>
                  <Td><Link
                    borderBottom="1px rgba(255,255,255,0.66) dotted"
                    borderRadius={1}
                    lineHeight={1.2}
                    _hover={{
                      textDecoration: "none",
                      borderBottom: "1px rgba(255,255,255,0.9) dotted",
                    }} isExternal href={`https://etherscan.io/address/${grant.address}`}>{accountDisplay(grant.address)}</Link></Td>
                  <Td>
                    {format(new Date(grant.startTimestamp.toNumber() * 1000), 'M/d/yy')}
                  </Td>
                  <Td>
                    {format(new Date(grant.cliffTimestamp.toNumber() * 1000), 'M/d/yy')}
                  </Td>
                  <Td>{parseInt(ethers.utils.formatUnits(grant.quarterlyAmount, 18)).toLocaleString()} SNX</Td>
                  <Td>{parseInt(ethers.utils.formatUnits(grant.totalAmount, 18)).toLocaleString()} SNX</Td>
                  <Td>{parseInt(ethers.utils.formatUnits(grant.amountRedeemed, 18)).toLocaleString()} SNX</Td>
                  <Td><EditIcon /></Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      }

    </Box >
  )
}
