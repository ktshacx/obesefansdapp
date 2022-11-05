import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {

  function getLibrary(provider) {
    return new Web3(provider);
  }

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ChakraProvider>
        <ColorModeScript initialColorMode='dark'></ColorModeScript>
      <Component {...pageProps} />
      </ChakraProvider>
    </Web3ReactProvider>
  )
}

export default MyApp
