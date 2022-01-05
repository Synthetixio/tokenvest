import { useState, useEffect } from 'react'
import { Heading, Box, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Link } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsCashStack } from 'react-icons/bs'
import { ethers } from 'ethers'
import SafeBatchSubmitter from "../../../lib/utils/SafeBatchSubmitter.js";

export default function TokenBalance() {
  const toast = useToast();

  const [loadingData, setLoadingData] = useState(false);
  const [tokenData, setTokenData] = useState({})

  const contractAddress = process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoadingData(true)
    fetch(`https://api.ethplorer.io/getAddressInfo/${contractAddress}?apiKey=freekey`)
      .then(response => response.json())
      .then(data => {
        setTokenData(data.tokens)
        setLoadingData(false)
      });
  }

  async function generateSafeBatchSubmitter() {
    const provider = new ethers.providers.Web3Provider(window?.ethereum);
    let signer = provider.getSigner();
    signer.address = await signer.getAddress();
    let network = await provider.getNetwork();
    const safeBatchSubmitter = new SafeBatchSubmitter({
      network: network.name,
      signer,
      safeAddress: process.env.NEXT_PUBLIC_MULTISIG_ADDRESS,
    });
    await safeBatchSubmitter.init();
    return safeBatchSubmitter;
  }

  const queueWithdrawal = async (address, amount) => {
    setLoadingData(true)

    const vesterInterface = new ethers.utils.Interface([
      "function withdraw(address withdrawalTokenAddress, uint256 withdrawalTokenAmount)"
    ]);

    // Queue transactions
    const safeBatchSubmitter = await generateSafeBatchSubmitter();

    const data = vesterInterface.encodeFunctionData("withdraw", [
      address,
      amount
    ]);
    await safeBatchSubmitter.appendTransaction({
      to: contractAddress,
      data,
      force: false,
    });

    // Submit transactions
    try {
      const submitResult = await safeBatchSubmitter.submit();
      toast({
        title: "Transaction Queued",
        description: submitResult.transactions.length
          ? `You’ve successfully queued the withdrawal transaction in the Gnosis Safe.`
          : "A transaction wasn’t added. It is likely already awaiting execution in the Gnosis Safe.",
        status: "success",
        isClosable: true,
      });
    } catch {
      toast({
        title: "Error",
        description: `Something went wrong when attempting to queue this transaction.`,
        status: "error",
        isClosable: true,
      });
    } finally {
      loadData()
    }
  }

  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsCashStack} boxSize={5} mr={2} />Token Balances</Heading>
      {loadingData ?
        <Spinner d="block" mx="auto" mt={12} mb={8} /> :
        (tokenData && tokenData.length ?
          <Table size="sm" variant='simple' my={3}>
            <Thead>
              <Tr>
                <Th>Token</Th>
                <Th>Amount</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {tokenData.map(token => {
                return (
                  <Tr>
                    <Td>
                      {token.tokenInfo.name}
                    </Td>
                    <Td>
                      {token.balance / Math.pow(10, token.tokenInfo.decimals)} {token.tokenInfo.symbol}
                    </Td>
                    <Td>
                      <Button colorScheme='green' onClick={() => queueWithdrawal(token.tokenInfo.address, token.balance)} size="sm">Queue Withdrawal</Button>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
          : <Text mt={14} mb={12} textAlign="center" opacity={0.8}>No tokens balances found</Text>)
      }
      <Text fontSize="xs" textAlign="center" opacity={0.8}>Token balances provided by <Link
        d="inline"
        borderBottom="1px rgba(255,255,255,0.66) dotted"
        borderRadius={1}
        _hover={{
          textDecoration: "none",
          borderBottom: "1px rgba(255,255,255,0.9) dotted",
        }} href={`https://ethplorer.io/address/${contractAddress}`} isExternal>ethplorer</Link></Text>
    </Box >
  )
}
