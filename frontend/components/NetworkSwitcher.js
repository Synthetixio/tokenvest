import React, { useEffect, useState } from 'react'
import { ethers, utils } from 'ethers'

import { Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody } from '@chakra-ui/react'

const NetworkSwitcher = () => {
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    (async function () {
      const provider = new ethers.getDefaultProvider({ infura: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID })
      const resp = await provider.getNetwork()
      if (resp.chainId == 1) {
        setChainId("0x1");
      } else if (resp.chainId == 10) {
        setChainId("0xa");
      } else {
        setChainId(resp.chainId);
      }
    })();
  }, [])

  function networkName(id) {
    switch (id) {
      case "0x1":
        return "Ethereum";
      case "0xa":
        return "Optimism";
      default:
        return 'Other Network';
    }
  }

  const changeNetwork = async (id) => {
    await window?.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: id }],
    });
    window.location.reload();
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Button mr={4}>
          {networkName(chainId)}
        </Button>
      </PopoverTrigger>
      <PopoverContent border="none" maxWidth="140px">
        <PopoverArrow />
        <PopoverBody p="0">
          <Button variant="outline" borderBottom="none" borderRadius="0" w="100%" d="block" onClick={e => changeNetwork("0x1")}>Ethereum</Button>
          <Button variant="outline" borderRadius="0" w="100%" d="block" onClick={e => changeNetwork("0xa")}>Optimism</Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default NetworkSwitcher
