import { useState } from 'react'
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  InputGroup,
  InputRightAddon
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import SafeBatchSubmitter from "../../../../lib/utils/SafeBatchSubmitter.js";
import { useToast } from '@chakra-ui/react'

export default function GrantModal({ grant }) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast();
  const contractAddress = process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS

  const [granteeAddress, setGranteeAddress] = useState('')
  const [startTimestamp, setStartTimestamp] = useState('')
  const [cliffTimestamp, setCliffTimestamp] = useState('')
  const [vestAmount, setVestAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [amountRedeemed, setAmountRedeemed] = useState('')
  const [vestInterval, setVestInterval] = useState('')

  const openHandler = () => {
    if (grant) {
      setStartTimestamp(grant.startTimestamp)
      setCliffTimestamp(grant.cliffTimestamp)
      setVestAmount(parseFloat(ethers.utils.formatUnits(grant.vestAmount, 18)))
      setTotalAmount(parseFloat(ethers.utils.formatUnits(grant.totalAmount, 18)))
      setAmountRedeemed(parseFloat(ethers.utils.formatUnits(grant.amountRedeemed, 18)))
      setVestInterval(grant.vestInterval)
    }
    onOpen();
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

  const queueTransaction = async () => {
    const safeBatchSubmitter = await generateSafeBatchSubmitter();

    const vesterInterface = new ethers.utils.Interface([
      "function updateGrant(uint tokenId, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval)",
      "function mint(address granteeAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval)",
    ]);

    const data = grant ? vesterInterface.encodeFunctionData("updateGrant", [
      grant.tokenId,
      startTimestamp,
      cliffTimestamp,
      ethers.utils.parseEther(vestAmount.toString()),
      ethers.utils.parseEther(totalAmount.toString()),
      ethers.utils.parseEther(amountRedeemed.toString()),
      vestInterval,
    ]) : vesterInterface.encodeFunctionData("mint", [
      granteeAddress,
      startTimestamp,
      cliffTimestamp,
      ethers.utils.parseEther(vestAmount.toString()),
      ethers.utils.parseEther(totalAmount.toString()),
      ethers.utils.parseEther(amountRedeemed.toString()),
      vestInterval,
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
          ? `You’ve successfully queued this transaction in the Gnosis Safe.`
          : "A transaction wasn’t added. It is likely already awaiting execution in the Gnosis Safe.",
        status: "success",
        isClosable: true,
      });

      onClose();

    } catch {
      toast({
        title: "Error",
        description: `Something went wrong when attempting to queue this transaction.`,
        status: "error",
        isClosable: true,
      });
    }
  }

  return (<>
    {grant ?
      <EditIcon onClick={openHandler} boxSize={4} mr={2} /> :
      <Button onClick={openHandler} ml="auto" colorScheme="green" size="sm">Create Grant</Button>
    }
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {grant ?
            `Update Grant #${grant.tokenId}` :
            "Create Grant"
          }
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          {!grant && <FormControl mb={5}>
            <FormLabel htmlFor='granteeAddress'>Grantee Address</FormLabel>
            <Input value={granteeAddress} onChange={(e) => setGranteeAddress(e.target.value)} id='granteeAddress' />
            <FormHelperText>This is wallet address of the grant recipient.</FormHelperText>
          </FormControl>}

          <FormControl mb={5}>
            <FormLabel htmlFor='startTimestamp'>Start Timestamp</FormLabel>
            <Input value={startTimestamp} onChange={(e) => setStartTimestamp(e.target.value)} id='startTimestamp' type="number" />
            <FormHelperText>This is the time at which the the grant begins to vest. The current timestamp is {Math.floor(Date.now() / 1000)}.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='cliffTimestamp'>Cliff Timestamp</FormLabel>
            <Input value={cliffTimestamp} onChange={(e) => setCliffTimestamp(e.target.value)} id='cliffTimestamp' type="number" />
            <FormHelperText>This is the time before which no tokens may be redeemed. The timestamp six months from now is {Math.floor(Date.now() / 1000) + (7889400 * 2)}.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='vestInterval'>Vesting Interval</FormLabel>
            <Input value={vestInterval} onChange={(e) => setVestInterval(e.target.value)} id='vestInterval' type="number" />
            <FormHelperText>This is the number of seconds that must pass for each vesting amount to become available to the grantee. There are 7889400 seconds in each quarter.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='vestAmount'>Vesting Amount</FormLabel>
            <InputGroup>
              <Input value={vestAmount} onChange={(e) => setVestAmount(e.target.value)} type="number" id='vestAmount' />
              <InputRightAddon>SNX</InputRightAddon>
            </InputGroup>
            <FormHelperText>This is the amount of tokens that are made available to the grantee each vesting interval.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='amountRedeemed'>Amount Redeemed</FormLabel>
            <InputGroup>
              <Input value={amountRedeemed} onChange={(e) => setAmountRedeemed(e.target.value)} type="number" id='amountRedeemed' />
              <InputRightAddon>SNX</InputRightAddon>
            </InputGroup>
            <FormHelperText>This is the amount of tokens that have already been redeemed from this grant.</FormHelperText>
          </FormControl>

          <FormControl mb={3}>
            <FormLabel htmlFor='totalAmount'>Total Grant Amount</FormLabel>
            <InputGroup>
              <Input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} type="number" id='totalAmount' />
              <InputRightAddon>SNX</InputRightAddon>
            </InputGroup>
            <FormHelperText>This is total amount of tokens awarded over the lifetime of this grant.</FormHelperText>
          </FormControl>

        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' isFullWidth mb={3} onClick={queueTransaction}>
            Queue Transaction
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal></>
  )
}
