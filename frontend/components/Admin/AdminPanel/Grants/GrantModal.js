import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'

export default function GrantModal({ tokenId }) {
  const newGrant = tokenId == undefined
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (<>
    {newGrant ?
      <Button onClick={onOpen} ml="auto" colorScheme="green" size="sm">Create Grant</Button> :
      <EditIcon onClick={onOpen} boxSize={4} mr={2} />
    }
    <Modal isOpen={isOpen} onClose={onClose}>
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
          t.c.
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='blue' onClick={onClose}>
            Queue Transaction
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal></>
  )
}
