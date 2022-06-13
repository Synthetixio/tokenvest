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
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const { chains, provider } = configureChains(
  [chain.mainnet, chain.optimism, chain.rinkeby],
  [
    infuraProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Tokenvest',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
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
      <WagmiConfig client={wagmiClient}>
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
