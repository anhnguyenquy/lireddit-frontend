import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
import '../globals.css'
import theme from '../theme'

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default App
