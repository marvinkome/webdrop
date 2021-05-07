import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
import { theme } from "theme"
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider theme={theme}>
            <Head>
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap"
                    rel="stylesheet"
                />

                <title>ADrop</title>
            </Head>

            <Component {...pageProps} />
        </ChakraProvider>
    )
}

export default MyApp
