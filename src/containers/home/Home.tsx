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

    connectingPeers: string[]
    connectedPeers: string[]
    onSelectFile: (peerId: string, file?: File) => void
}

export function HomePage(props: Props) {
    return (
        <>
            <Header />

            <section className={styles.body}>
                <div className={styles.innerBody}>
                    {props.me && <User avatar={props.me.avatar} name={props.me.name} />}

                    {props.peers?.map(({ id, avatar, name }) => (
                        <Peer
                            avatar={avatar}
                            name={name}
                            key={id}
                            isConnecting={props.connectingPeers.includes(id)}
                            isConnected={props.connectedPeers.includes(id)}
                            onSelectFile={(file) => props.onSelectFile(id, file)}
                        />
                    ))}

                    <Circles />
                </div>
            </section>

            <Footer />
        </>
    )
}
