import React, { useEffect, useState } from 'react'
import { useEthers, shortenAddress, useLookupAddress } from '@usedapp/core'

import { Icon } from '@chakra-ui/icons'
import { BsCircleFill } from 'react-icons/bs'
import Web3Modal from 'web3modal'
import { useToast, Box, Button } from '@chakra-ui/react'
import WalletConnectProvider from '@walletconnect/web3-provider'

const Web3ModalButton = () => {
  const { account, activate, deactivate } = useEthers()
  const ens = useLookupAddress()
  const { error } = useEthers()
  const toast = useToast()

  useEffect(() => {
    if (error) {
      useToast({
        title: 'Error',
        description: error.message,
      })
    }
  }, [error])

  const activateProvider = async () => {
    const providerOptions = {
      injected: {
        display: {
          name: 'Metamask',
          description: 'Connect with the provider in your Browser',
          status: 'error',
        },
        package: null,
      },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          bridge: 'https://bridge.walletconnect.org',
          infuraId: '57fc2c19095745e59ab96a4aa87dada8',
        },
      },
    }

    const web3Modal = new Web3Modal({
      providerOptions,
    })
    try {
      const provider = await web3Modal.connect()
      await activate(provider)
    } catch (error) {
      toast({
        title: 'Could not connect to wallet',
        description: error,
        status: 'error',
      })
    }
  }

  return (
    <Box d="inline-block" textAlign="right">
      {account ? (
        <>
          <Button
            key={1}
            leftIcon={<Icon as={BsCircleFill} color="green" />}
            mr={4}
            pointerEvents="none"
            background="blackAlpha.400"
          >
            {ens ?? shortenAddress(account)}
          </Button>
          <Button key={2} onClick={() => deactivate()}>
            Disconnect
          </Button>
        </>
      ) : (
        <Button key={3} onClick={activateProvider}>
          Connect
        </Button>
      )}
    </Box>
  )
}

export default Web3ModalButton
