"use client";
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
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import Head from "next/head";
import { RecoilRoot } from "recoil";
import theme from "../styles/theme";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: "My RainbowKit App",
  projectId: "5075a2da602e17eec34aa77b40b321be",
  chains: [mainnet, optimism],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();
  return (
    <RecoilRoot>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
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
        </QueryClientProvider>
      </WagmiProvider>
    </RecoilRoot>
  );
}

export default MyApp;
