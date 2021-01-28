import styles from "./style.module.scss"

export function DownloadProgress() {
    return (
        <div className={styles.downloadProgress}>
            <div className={styles.inner}>
                <p>Tranferring "File name" (16mb) to Generous Deer</p>
                <span>Sent 1mb of 16mb (15kbps)</span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.innerProgress} />
            </div>
        </div>
    )
}
