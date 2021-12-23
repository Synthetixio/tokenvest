import Head from 'next/head'
import { ChakraProvider } from '@chakra-ui/react'
import { UseWalletProvider } from 'use-wallet'
import { Heading, Flex, Container, Box } from '@chakra-ui/react'
import WalletConnector from '../components/WalletConnector'
import theme from '../styles/theme'

function MyApp({ Component, pageProps }) {
  return (
    <UseWalletProvider>
      <ChakraProvider theme={theme}>
        <Head>
          <title>snxVest</title>
          <meta name="description" content="coming soon" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Container as="main" maxW='container.md'>
          <Flex as="header" pt={9} pb={6}>
            <Heading size="lg" fontWeight="light">snxVest</Heading>
            <Box ml="auto">
              <WalletConnector />
            </Box>
          </Flex>
          <Component {...pageProps} />
        </Container>
      </ChakraProvider>
    </UseWalletProvider>
  )
}

export default MyApp
