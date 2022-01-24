import Head from 'next/head'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { UseWalletProvider } from 'use-wallet'
import { Heading, Flex, Container, Box } from '@chakra-ui/react'
import { RecoilRoot } from 'recoil';
import WalletConnector from '../components/WalletConnector'
import theme from '../styles/theme'

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <UseWalletProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>
          <Head>
            <title>tokenvest</title>
            <meta name="description" content="Token Grant Management" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Container as="main" maxW='container.md'>
            <Flex as="header" pt={9} pb={6}>
              <Heading size="lg" fontWeight="thin" letterSpacing="1px">tokenvest</Heading>
              <Box ml="auto">
                <WalletConnector />
              </Box>
            </Flex>
            <Component {...pageProps} />
          </Container>
        </ChakraProvider>
      </UseWalletProvider>
    </RecoilRoot >
  )
}

export default MyApp
