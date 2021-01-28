import styles from "./home.module.scss"
import { Header } from "components/Header"
import { Footer } from "components/Footer"
import { Circles } from "components/Circles"
import { Progress } from "components/Progress"
import { User, Peer } from "components/Users"
import { User as UserType, TransferDetails } from "./hooks"

type Props = {
    me?: UserType
    peers?: UserType[]
    connectingPeers: string[]
    connectedPeers: string[]
    transferDetails: TransferDetails | null
    fileState: "uploading" | "downloading" | null
    dataTransferred: number
    onSelectFile: (peerId: string, file?: File) => void
}

export function HomePage(props: Props) {
    return (
        <>
            <Header />

            {props.transferDetails && (
                <Progress
                    fileState={props.fileState}
                    fileName={props.transferDetails.fileName}
                    fileSize={props.transferDetails.fileSize}
                    dataTransferred={props.dataTransferred}
                    peerName={
                        props.peers?.find(({ id }) => id === props.transferDetails?.peerId)?.name ||
                        ""
                    }
                />
            )}

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
