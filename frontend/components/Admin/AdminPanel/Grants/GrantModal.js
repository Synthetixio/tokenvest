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

export default function GrantModal({ tokenId }) {
  const newGrant = tokenId == undefined
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [granteeAddress, setGranteeAddress] = useState('')
  const [startTimestamp, setStartTimestamp] = useState('')
  const [cliffTimestamp, setCliffTimestamp] = useState('')
  const [vestAmount, setVestAmount] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [amountRedeemed, setAmountRedeemed] = useState('')
  const [vestInterval, setVestInterval] = useState('')

  // address granteeAddress, uint64 startTimestamp, uint64 cliffTimestamp, uint128 vestAmount, uint128 totalAmount, uint128 amountRedeemed, uint32 vestInterval

  return (<>
    {newGrant ?
      <Button onClick={onOpen} ml="auto" colorScheme="green" size="sm">Create Grant</Button> :
      <EditIcon onClick={onOpen} boxSize={4} mr={2} />
    }
    <Modal size="lg" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {newGrant ?
            "Create Grant" :
            `Update Grant #${tokenId}`
          }
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>

          {newGrant && <FormControl mb={5}>
            <FormLabel htmlFor='granteeAddress'>Grantee Address</FormLabel>
            <Input onChange={(e) => setGranteeAddress(e.target.value)} id='granteeAddress' />
            <FormHelperText>This is wallet address of the grant recipient.</FormHelperText>
          </FormControl>}

          <FormControl mb={5}>
            <FormLabel htmlFor='startTimestamp'>Start Timestamp</FormLabel>
            <Input onChange={(e) => setStartTimestamp(e.target.value)} id='startTimestamp' />
            <FormHelperText>This is the time at which the the grant begins to vest. The current timestamp is {Math.floor(Date.now() / 1000)}.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='cliffTimestamp'>Cliff Timestamp</FormLabel>
            <Input onChange={(e) => setCliffTimestamp(e.target.value)} id='cliffTimestamp' />
            <FormHelperText>This is the time before which no tokens may be redeemed. The timestamp six months from now is {Math.floor(Date.now() / 1000) + (7889400 * 2)}.</FormHelperText>
          </FormControl>


          <FormControl mb={5}>
            <FormLabel htmlFor='vestInterval'>Vesting Interval</FormLabel>
            <Input onChange={(e) => setVestInterval(e.target.value)} id='vestInterval' />
            <FormHelperText>This is the number of seconds that must pass for each vesting amount to become available to the grantee. There are 7889400 seconds in each quarter.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='vestAmount'>Vesting Amount</FormLabel>
            <InputGroup>
              <Input onChange={(e) => setVestAmount(e.target.value)} type="number" id='vestAmount' />
              <InputRightAddon children='SNX' />
            </InputGroup>
            <FormHelperText>This is the amount of tokens that are made available to the grantee each vesting interval.</FormHelperText>
          </FormControl>

          <FormControl mb={5}>
            <FormLabel htmlFor='amountRedeemed'>Amount Redeemed</FormLabel>
            <InputGroup>
              <Input onChange={(e) => setAmountRedeemed(e.target.value)} type="number" id='amountRedeemed' />
              <InputRightAddon children='SNX' />
            </InputGroup>
            <FormHelperText>This is the amount of tokens that have already been redeemed by from grant.</FormHelperText>
          </FormControl>

          <FormControl mb={3}>
            <FormLabel htmlFor='totalAmount'>Total Grant Amount</FormLabel>
            <InputGroup>
              <Input onChange={(e) => setTotalAmount(e.target.value)} type="number" id='totalAmount' />
              <InputRightAddon children='SNX' />
            </InputGroup>
            <FormHelperText>This is total amount of tokens awarded over the lifetime of this grant.</FormHelperText>
          </FormControl>

        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' isFullWidth mb={3} onClick={onClose}>
            Queue Transaction
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal></>
  )
}
