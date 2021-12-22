import Head from 'next/head'
import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'
import { Heading, Flex, Container, Box } from '@chakra-ui/react'
import WalletConnector from '../components/WalletConnector'

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const theme = extendTheme({ config })

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <Head>
        <title>Web3 Carta</title>
        <meta name="description" content="coming soon" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container as="main">
        <Flex as="header" pt={9} pb={6}>
          <Heading size="lg" fontWeight="light">snxVest</Heading>

          <Box ml="auto">
            <WalletConnector />
          </Box>

        </Flex>
        <Component {...pageProps} />
      </Container>
    </ChakraProvider>
  )
}

export default MyApp
