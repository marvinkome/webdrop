import Head from "next/head"
import { Room } from "containers/room"

export default function Index() {
    return (
        <main className="container">
            <Head>
                <title>Webdrop</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Room />
        </main>
    )
}
