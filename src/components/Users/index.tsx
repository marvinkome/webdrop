import styles from "./styles.module.scss"

export function User({ avatar, name }: { avatar: string; name: string }) {
    return (
        <div className={styles.userAvatar}>
            <img src={avatar} alt="My Avatar" />
            <span>{name}</span>
        </div>
    )
}

export function Peer({ avatar, name }: { avatar: string; name: string }) {
    return (
        <div className={styles.peerAvatar}>
            <img src={avatar} alt="Peer Avatar" />

            <span>{name}</span>
        </div>
    )
}
