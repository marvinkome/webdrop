import Head from "next/head"
import { ToastContainer } from "react-toastify"
import { Home } from "containers/home"
import "react-toastify/dist/ReactToastify.css"

export default function Index() {
    return (
        <main className="container">
            <Head>
                <title>Webdrop</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Home />

            <ToastContainer />
        </main>
    )
}
