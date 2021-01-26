import styles from "./styles.module.scss"

export function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.logoArea}>
                <h1>WebDrop</h1>
                <small>P2P data transfer</small>
            </div>
        </header>
    )
}
