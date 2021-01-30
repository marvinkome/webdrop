import styles from "./home.module.scss"
import { Header } from "components/Header"
import { Footer } from "components/Footer"
import { Circles } from "components/Circles"
import { Progress } from "components/Progress"
import { User, Peer } from "components/Users"
import { User as UserType, TransferDetails, ConnectionStats } from "./hooks"

type Props = {
    me?: UserType
    peers?: UserType[]
    connectionStats: ConnectionStats[]
    transferDetails: TransferDetails[]
    onSelectFile: (peerId: string, file?: File) => void
}

export function HomePage(props: Props) {
    return (
        <>
            <Header />

            {props.transferDetails.map((details) => (
                <Progress
                    key={details.peerId}
                    transferDetails={details}
                    peerName={props.peers?.find(({ id }) => id === details?.peerId)?.name || ""}
                />
            ))}

            <section className={styles.body}>
                <div className={styles.innerBody}>
                    {props.me && <User avatar={props.me.avatar} name={props.me.name} />}

                    {props.peers?.map(({ id, avatar, name }) => (
                        <Peer
                            avatar={avatar}
                            name={name}
                            key={id}
                            stats={props.connectionStats.find((peer) => peer.peerId === id)}
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
