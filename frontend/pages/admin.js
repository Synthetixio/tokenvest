import { Text } from "@chakra-ui/react";
import AdminPanel from "../components/Admin/AdminPanel";
import { useAccount } from "wagmi";
import vesterAbi from "../abis/Vester.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthersSigner } from "../utils/ethers";

export default function Admin() {
  const { address, chain } = useAccount();
  const signer = useEthersSigner({ chainId: chain?.id || "10" });
  const [owner, setOwner] = useState(null);
  useEffect(() => {
    async function getOwner() {
      if (!signer) return;
      const vesterContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
        vesterAbi.abi,
        signer
      ); // should be provider.getSigner() ?
      const owner = await vesterContract.owner();
      setOwner(owner);
    }
    getOwner();
  }, [signer]);

  const shouldRender = address;

  return (
    <div>
      <main>
        {shouldRender ? (
          <AdminPanel />
        ) : (
          <Text
            textAlign="center"
            py={16}
            fontWeight="thin"
            fontSize="3xl"
            letterSpacing={1.5}
          >
            Connect the admin wallet to manage grants.
          </Text>
        )}
      </main>
    </div>
  );
}
