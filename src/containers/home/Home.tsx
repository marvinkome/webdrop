import styles from "./home.module.scss"
import { Header } from "components/Header"
import { Footer } from "components/Footer"
import { Circles } from "components/Circles"
import { User, Peer } from "components/Users"
import { User as UserType } from "./hooks"

type Props = {
    me?: UserType
    peers?: UserType[]
    transferData?: any
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
                            transferData={props.transferData}
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
