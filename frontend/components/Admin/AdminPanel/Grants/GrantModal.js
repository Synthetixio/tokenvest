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
  LightMode,
  InputGroup,
  InputRightAddon
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { EditIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import vesterAbi from '../../../../abis/Vester.json'
import { useToast } from '@chakra-ui/react'
import { useSigner } from 'wagmi'

export default function GrantModal({ grant }) {
  const { data: signer } = useSigner()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast();

  const [granteeAddress, setGranteeAddress] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [startTimestamp, setStartTimestamp] = useState('0')
  const [cliffTimestamp, setCliffTimestamp] = useState('0')
  const [vestAmount, setVestAmount] = useState('0')
  const [totalAmount, setTotalAmount] = useState('0')
  const [amountRedeemed, setAmountRedeemed] = useState('0')
  const [vestInterval, setVestInterval] = useState('0')

  const openHandler = () => {
    if (grant) {
      setTokenAddress(grant.tokenAddress)
      setStartTimestamp(grant.startTimestamp)
      setCliffTimestamp(grant.cliffTimestamp)
      setVestAmount(parseFloat(ethers.utils.formatUnits(grant.vestAmount, 18)))
      setTotalAmount(parseFloat(ethers.utils.formatUnits(grant.totalAmount, 18)))
      setAmountRedeemed(parseFloat(ethers.utils.formatUnits(grant.amountRedeemed, 18)))
      setVestInterval(grant.vestInterval)
    }
    onOpen();
  }

  const executeTransaction = async () => {
    const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, signer);

    let checksummedTokenAddress, checksummedGranteeAddress;
    try {
      checksummedTokenAddress = ethers.utils.getAddress(tokenAddress)
      if (!grant) {
        checksummedGranteeAddress = ethers.utils.getAddress(granteeAddress)
      }
    } catch {
      toast({
        title: "Couldn’t Execute Transaction",
        description: `Make sure all addresses are valid.`,
        status: "error",
        isClosable: true,
      });
      return
    }

    const args = grant ? [
      grant.tokenId,
      checksummedTokenAddress,
      startTimestamp,
      cliffTimestamp,
      ethers.utils.parseEther(vestAmount.toString()),
      ethers.utils.parseEther(totalAmount.toString()),
      ethers.utils.parseEther(amountRedeemed.toString()),
      vestInterval,
    ] : [
      checksummedGranteeAddress,
      checksummedTokenAddress,
      startTimestamp,
      cliffTimestamp,
      ethers.utils.parseEther(vestAmount.toString()),
      ethers.utils.parseEther(totalAmount.toString()),
      ethers.utils.parseEther(amountRedeemed.toString()),
      vestInterval,
    ]

    try {
      if (grant) {
        await vesterContract.replaceGrant(...args)
      } else {
        await vesterContract.mint(...args)
      }
    } catch (err) {
      console.log(err)
      toast({
        title: "Error",
        description: err?.data?.message || JSON.stringify(err),
        status: "error",
        isClosable: true,
      });
      return
    }

    toast({
      title: 'Transaction Submitted',
      description:
        'Refer to your wallet for the latest status of this transaction. Refresh the page for an updated list of grants.',
      status: 'info',
      position: 'top',
      duration: 10000,
      isClosable: true,
    })

  }

  function displayTime(input) {
    return format(new Date(input * 1000), 'MMM. d ’yy, p')
  }

  return (<>
    {grant ?
      <EditIcon onClick={openHandler} cursor="pointer" boxSize={4} mr={2} /> :
      <LightMode><Button onClick={openHandler} ml="auto" colorScheme="blue" size="sm">Create Grant</Button></LightMode>
    }
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {grant ?
            `Replace Grant #${grant.tokenId}` :
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
            <FormLabel htmlFor='tokenAddress'>Token Address</FormLabel>
            <Input value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} id='tokenAddress' />
            <FormHelperText>This is the address of the ERC-20 token being provided by this grant.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='startTimestamp'>Start Timestamp</FormLabel>
            <InputGroup>
              <Input value={startTimestamp} onChange={(e) => setStartTimestamp(e.target.value)} id='startTimestamp' type="number" />
              {startTimestamp > 0 && <InputRightAddon>{displayTime(startTimestamp)}</InputRightAddon>}
            </InputGroup>
            <FormHelperText>This is the time at which the the grant begins to vest. The current timestamp is {Math.floor(Date.now() / 1000)}.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='cliffTimestamp'>Cliff Timestamp</FormLabel>
            <InputGroup>
              <Input value={cliffTimestamp} onChange={(e) => setCliffTimestamp(e.target.value)} id='cliffTimestamp' type="number" />
              {cliffTimestamp > 0 && <InputRightAddon>{displayTime(cliffTimestamp)}</InputRightAddon>}
            </InputGroup>
            <FormHelperText>This is the time before which no tokens may be redeemed. The timestamp six months from now is {Math.floor(Date.now() / 1000) + (7889400 * 2)}.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='vestInterval'>Vesting Interval</FormLabel>
            <Input value={vestInterval} onChange={(e) => setVestInterval(e.target.value)} id='vestInterval' type="number" />
            <FormHelperText>This is the number of seconds that must pass for each vesting amount to become available to the grantee. There are 7889400 seconds in each quarter.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='vestAmount'>Vesting Amount</FormLabel>
            <Input value={vestAmount} onChange={(e) => setVestAmount(e.target.value)} type="number" id='vestAmount' />
            <FormHelperText>This is the amount of tokens that are made available to the grantee each vesting interval.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='amountRedeemed'>Amount Redeemed</FormLabel>
            <Input value={amountRedeemed} onChange={(e) => setAmountRedeemed(e.target.value)} type="number" id='amountRedeemed' />
            <FormHelperText>This is the amount of tokens that have already been redeemed from this grant.</FormHelperText>
          </FormControl>

          <FormControl mb={3}>
            <FormLabel htmlFor='totalAmount'>Total Grant Amount</FormLabel>
            <Input value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} type="number" id='totalAmount' />
            <FormHelperText>This is total amount of tokens awarded over the lifetime of this grant.</FormHelperText>
          </FormControl>

        </ModalBody>

        <ModalFooter>
          <LightMode>
            <Button colorScheme='blue' isFullWidth mb={3} onClick={executeTransaction}>
              Execute Transaction
            </Button>
          </LightMode>
        </ModalFooter>
      </ModalContent>
    </Modal></>
  )
}
