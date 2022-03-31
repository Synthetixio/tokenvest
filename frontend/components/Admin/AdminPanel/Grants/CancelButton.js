import { ethers } from 'ethers'
import { useToast, useDisclosure, Modal, ModalContent, ModalFooter, LightMode, SimpleGrid, Button, ModalOverlay, ModalHeader, ModalCloseButton } from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import SafeBatchSubmitter from "../../../../lib/utils/SafeBatchSubmitter.js";
import vesterAbi from '../../../../abis/Vester.json'

export default function CancelButton({ tokenId }) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const contractAddress = process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS

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

  const queueCancel = async () => {

    const vesterInterface = new ethers.utils.Interface([
      "function cancelGrant(uint256 tokenId)"
    ]);

    // Queue transactions
    const safeBatchSubmitter = await generateSafeBatchSubmitter();

    const data = vesterInterface.encodeFunctionData("cancelGrant", [
      tokenId
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
          ? `You’ve successfully queued the cancel transaction in the Gnosis Safe.`
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
    }
  }

  const executeCancel = async () => {
    const provider = new ethers.providers.Web3Provider(window?.ethereum)
    const signer = provider.getSigner();
    const vesterContract = new ethers.Contract(process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS, vesterAbi.abi, signer);

    try {
      await vesterContract.cancelGrant(tokenId)
    } catch (err) {
      console.log(err)
      toast({
        title: "Error",
        description: err?.data?.message || err,
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

  return (<>
    <DeleteIcon onClick={onOpen} cursor="pointer" boxSize={4} />
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Cancel Grant
        </ModalHeader>
        <ModalCloseButton />
        <ModalFooter>
          <LightMode>
            <SimpleGrid columns={2} spacing={6} w="100%">
              <Button colorScheme='blue' isFullWidth mb={3} onClick={() => executeCancel()}>
                Execute Transaction
              </Button>
              <Button colorScheme='blue' isFullWidth mb={3} onClick={() => queueCancel()}>
                Queue to Multisig
              </Button>
            </SimpleGrid>
          </LightMode>
        </ModalFooter>
      </ModalContent>
    </Modal>

  </>)
}
