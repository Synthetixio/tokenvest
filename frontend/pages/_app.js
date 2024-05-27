import {
  Box,
  ChakraProvider,
  ColorModeScript,
  Container,
  Flex,
  Heading,
} from "@chakra-ui/react";
import {
  ConnectButton,
  RainbowKitProvider,
  darkTheme,
  getDefaultWallets,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import Head from "next/head";
import { RecoilRoot } from "recoil";
import { WagmiConfig, chain, configureChains, createClient } from "wagmi";
import { infuraProvider } from "wagmi/providers/infura";
import theme from "../styles/theme";

const { chains, provider } = configureChains(
  [chain.mainnet, chain.optimism, chain.rinkeby],
  [infuraProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID })]
);

const { connectors } = getDefaultWallets({
  appName: "Tokenvest",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

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
            <Container as="main" maxW="container.md">
              <Flex as="header" pt={9} pb={6}>
                <Heading size="lg" fontWeight="thin" letterSpacing="1px">
                  Tokenvest
                </Heading>
                <Box ml="auto">
                  <ConnectButton />
                </Box>
              </Flex>
              <Component {...pageProps} />
            </Container>
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </RecoilRoot>
  );
}

export default MyApp;
