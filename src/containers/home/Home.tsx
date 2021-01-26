import styles from "./home.module.scss"
import { Header } from "components/Header"
import { Footer } from "components/Footer"
import { Circles } from "components/Circles"
import { User, Peer } from "components/Users"

export function HomePage() {
    return (
        <>
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
        </>
    )
}
