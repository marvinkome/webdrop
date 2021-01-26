import Head from "next/head"
import { Home } from "containers/home"

export default function Index() {
    return (
        <main className="container">
            <Head>
                <title>Webdrop</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Home />
        </main>
    )
}
