import Head from 'next/head'
import { DAppProvider } from '@usedapp/core'
import { ChakraProvider, ColorModeScript, Heading, Flex, Container, Box } from '@chakra-ui/react'
import { RecoilRoot } from 'recoil';
import WalletConnector from '../components/WalletConnector.tsx'
import NetworkSwitcher from '../components/NetworkSwitcher'
import theme from '../styles/theme'

function MyApp({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <DAppProvider>
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
                <NetworkSwitcher />
                <WalletConnector />
              </Box>
            </Flex>
            <Component {...pageProps} />
          </Container>
        </ChakraProvider>
      </DAppProvider>
    </RecoilRoot >
  )
}

export default MyApp
