import styles from "./styles.module.scss"

export function User() {
    return (
        <div className={styles.userAvatar}>
            <img src="/avatar1.jpeg" alt="User Avatar" />
            <span>You</span>
        </div>
    )
}

export function Peer() {
    return (
        <div className={styles.peerAvatar}>
            <img src="/avatar2.jpeg" alt="Peer Avatar" />

            <span>Invincible Kango</span>
        </div>
    )
}
