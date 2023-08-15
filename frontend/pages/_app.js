import Head from 'next/head'
import { ChakraProvider, ColorModeScript, Heading, Flex, Container, Box } from '@chakra-ui/react'
import { RecoilRoot } from 'recoil';
import theme from '../styles/theme'
import '@rainbow-me/rainbowkit/styles.css';
import { ethers } from 'ethers'
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import {
  createConfig,
  createClient,
  WagmiConfig,
  configureChains,
} from 'wagmi';
import {
  mainnet,
  optimism
} from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const { chains, publicClient } = configureChains(
  [mainnet, optimism],
  [
    infuraProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Tokenvest',
  projectId: '43f15102a1f8aa2f158d5016a454def6',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

if (typeof window !== "undefined") {
  const currentProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
  currentProvider.on("network", (newNetwork, oldNetwork) => {
    if (oldNetwork) {
      window.location.reload();
    }
  });
}

function MyApp({ Component, pageProps }) {

  return (
    <RecoilRoot>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme={darkTheme()}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <ChakraProvider theme={theme}>
            <Head>
              <title>Tokenvest</title>
              <meta name="description" content="Token Grant Manager" />
            </Head>
            <Container as="main" maxW='container.md'>
              <Flex as="header" pt={9} pb={6}>
                <Heading size="lg" fontWeight="thin" letterSpacing="1px">Tokenvest</Heading>
                <Box ml="auto">
                  <ConnectButton />
                </Box>
              </Flex>
              <Component {...pageProps} />
            </Container>
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </RecoilRoot >
  )
}

export default MyApp
