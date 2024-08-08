import { ethers } from "ethers";
import { useToast } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import vesterAbi from "../../../../abis/Vester.json";
import { useEthersSigner } from "../../../../utils/ethers";
import { useAccount } from "wagmi";

export default function CancelButton({ tokenId }) {
  const toast = useToast();
  const { chain } = useAccount();
  const signer = useEthersSigner({ chainId: chain.id });

  const executeCancel = async () => {
    const vesterContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
      vesterAbi.abi,
      signer
    );

    try {
      await vesterContract.cancelGrant(tokenId);
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: err?.data?.message || err?.error?.data?.message,
        status: "error",
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Transaction Submitted",
      description:
        "Refer to your wallet for the latest status of this transaction. Refresh the page for an updated list of grants.",
      status: "info",
      position: "top",
      duration: 10000,
      isClosable: true,
    });
  };

  return (
    <DeleteIcon onClick={() => executeCancel()} cursor="pointer" boxSize={4} />
  );
}
