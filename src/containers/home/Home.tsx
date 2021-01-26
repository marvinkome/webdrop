import styles from "./home.module.scss"
import { Header } from "components/Header"
import { Footer } from "components/Footer"
import { Circles } from "components/Circles"
import { User, Peer } from "components/Users"

type Props = {
    me?: {
        avatar: string
        name: string
        id: string
    }

    peers?: Array<{
        avatar: string
        name: string
        id: string
    }>
}
export function HomePage(props: Props) {
    return (
        <>
            <Header />

            <section className={styles.body}>
                <div className={styles.innerBody}>
                    {props.me && <User avatar={props.me.avatar} name={props.me.name} />}

                    {props.peers?.map(({ id, avatar, name }) => (
                        <Peer avatar={avatar} name={name} key={id} />
                    ))}

                    <Circles />
                </div>
            </section>

            <Footer />
        </>
    )
}
