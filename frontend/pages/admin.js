import { Text } from "@chakra-ui/react";
import AdminPanel from "../components/Admin/AdminPanel";
import { useAccount } from "wagmi";
import vesterAbi from "../abis/Vester.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Admin() {
  const { address } = useAccount();

  const [_, setOwner] = useState(null);
  useEffect(() => {
    async function getOwner() {
      const provider = new ethers.providers.Web3Provider(window?.ethereum);
      const vesterContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
        vesterAbi.abi,
        provider
      ); // should be provider.getSigner() ?
      const owner = await vesterContract.owner();
      setOwner(owner);
    }
    getOwner();
  }, []);

  const shouldRender = address; // && address == owner;

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
