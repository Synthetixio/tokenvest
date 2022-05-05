import { useState, useEffect } from 'react'
import { Heading, Box, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Link, LightMode, StatGroup, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { Icon } from '@chakra-ui/icons'
import { BsCashStack } from 'react-icons/bs'
import { ethers } from 'ethers'
import SafeBatchSubmitter from "../../../lib/utils/SafeBatchSubmitter.js";
import EtherscanLink from '../../shared/EtherscanLink'
import { useRecoilState } from 'recoil'
import { getGrants } from '../../../lib/store/grants'
import erc20Abi from '../../../abis/SampleToken.json'

export default function TokenBalance() {
  const toast = useToast();

  const [grants, setGrants] = useRecoilState(getGrants());
  const [loadingData, setLoadingData] = useState(false);
  const [tokenData, setTokenData] = useState({})
  const [chainId, setChainId] = useState(null)
  const [availableTokens, setAvailableTokens] = useState(0)

  const contractAddress = process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS

  useEffect(() => {
    (async function () {
      const provider = new ethers.providers.Web3Provider(window?.ethereum)
      const resp = await provider.getNetwork()
      if (resp.chainId == 1) {
        loadData()
      }
      setChainId(resp.chainId)
    })();
  }, [])

  useEffect(() => {
    (async function () {
      // We assume all grants use the same token address
      if (grants.length) {
        const provider = new ethers.providers.Web3Provider(window?.ethereum)
        const tokenAddress = grants[0].tokenAddress
        const erc20Contract = new ethers.Contract(tokenAddress, erc20Abi.abi, provider); // should be provider.getSigner() ?
        const tokenBalance = await erc20Contract.balanceOf(contractAddress);
        setAvailableTokens(parseFloat(ethers.utils.formatUnits((tokenBalance), 18)))
      }
    })();
  }, [grants]);

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

  const activeGrants = grants.filter(grant => !grant.cancelled);
  const stats = {
    granted: parseFloat(ethers.utils.formatUnits(activeGrants.reduce((acc, grant) => acc.add(grant.totalAmount), ethers.BigNumber.from(0)), 18)),
    vested: parseFloat(ethers.utils.formatUnits(activeGrants.reduce((acc, grant) => acc.add(grant.amountVested), ethers.BigNumber.from(0)), 18)),
    redeemed: parseFloat(ethers.utils.formatUnits(activeGrants.reduce((acc, grant) => acc.add(grant.amountRedeemed), ethers.BigNumber.from(0)), 18)),
    redeemable: parseFloat(ethers.utils.formatUnits(activeGrants.reduce((acc, grant) => acc.add(grant.amountAvailable), ethers.BigNumber.from(0)), 18)),
    available: availableTokens
  }

  return (
    <Box
      mb={8}
      borderRadius="md"
      background="gray.900"
      py={5}
      px={6}>
      <Heading size="lg" fontWeight="light"><Icon as={BsCashStack} boxSize={5} mr={2} />Token Balances</Heading>
      <Text fontSize="sm" mt="2" mb="4">Grant recipients can redeem their tokens from <EtherscanLink
        d="inline"
        borderBottom="1px rgba(255,255,255,0.66) dotted"
        borderRadius={1}
        _hover={{
          textDecoration: "none",
          borderBottom: "1px rgba(255,255,255,0.9) dotted",
        }} path={`/address/${process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS}`} isExternal>{process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS}</EtherscanLink>.</Text>
      {chainId == 1 && (loadingData ?
        <Spinner d="block" mx="auto" mt={12} mb={8} /> :
        (tokenData && tokenData.length ?
          <Table size="sm" variant='simple' mb={3}>
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
                  <Tr key={token.tokenInfo.symbol}>
                    <Td>
                      {token.tokenInfo.name}
                    </Td>
                    <Td>
                      {token.balance / Math.pow(10, token.tokenInfo.decimals)} {token.tokenInfo.symbol}
                    </Td>
                    <Td>
                      <LightMode>
                        <Button colorScheme='blue' float="right" onClick={() => queueWithdrawal(token.tokenInfo.address, token.balance)} size="sm">Queue Withdrawal</Button>
                      </LightMode>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
          : <Text mt={16} mb={14} textAlign="center" opacity={0.8}>No tokens balances found</Text>)
      )}
      <StatGroup>
        <Stat mb="3">
          <StatLabel>Granted</StatLabel>
          <StatNumber>{stats.granted.toLocaleString()}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Vested</StatLabel>
          <StatNumber>{stats.vested.toLocaleString()}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Redeemed</StatLabel>
          <StatNumber>{stats.redeemed.toLocaleString()}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Redeemable</StatLabel>
          <StatNumber>{stats.redeemable.toLocaleString()}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Available</StatLabel>
          <StatNumber>{stats.available.toLocaleString()}</StatNumber>
        </Stat>
      </StatGroup>

      {chainId == 1 &&
        <Text fontSize="xs" textAlign="center" opacity={0.8}>Token balances provided by <Link
          d="inline"
          borderBottom="1px rgba(255,255,255,0.66) dotted"
          borderRadius={1}
          _hover={{
            textDecoration: "none",
            borderBottom: "1px rgba(255,255,255,0.9) dotted",
          }} href={`https://ethplorer.io/address/${contractAddress}`} isExternal>ethplorer</Link></Text>
      }
    </Box >
  )
}
