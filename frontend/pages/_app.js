import {
  Box,
  ChakraProvider,
  ColorModeScript,
  Container,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { ConnectButton, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import Head from "next/head";
import { RecoilRoot } from "recoil";
import theme from "../styles/theme";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

import { config } from "../utils/wagmi";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
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
