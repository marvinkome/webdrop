import Head from "next/head"
import styles from "../styles/home.module.scss"
import { Header } from "components/Header"
import { Footer } from "components/Footer"
import { Circles } from "components/Circles"
import { User, Peer } from "components/Users"

export default function Home() {
    return (
        <main className={styles.container}>
            <Head>
                <title>Webdrop</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header />

            <section className={styles.body}>
                <div className={styles.innerBody}>
                    <User />

                    {Array.from({ length: 8 }, (_, idx) => (
                        <Peer key={idx} />
                    ))}

                    <Circles />
                </div>
            </section>

            <Footer />
        </main>
    )
}
