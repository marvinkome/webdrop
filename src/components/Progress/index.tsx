import styles from "./style.module.scss"

type ProgressProps = {
    fileName: string
    peerName: string
    fileSize: number
    dataTransferred: number
    fileState: "uploading" | "downloading" | null
}
export function Progress({ fileState, ...props }: ProgressProps) {
    if (fileState === "uploading") return <UploadProgress {...props} />
    if (fileState === "downloading") return <DownloadProgress {...props} />
    return null
}

type DownloadProps = {
    fileName: string
    peerName: string
    fileSize: number
    dataTransferred: number
}
function DownloadProgress(props: DownloadProps) {
    return (
        <div className={styles.downloadProgress}>
            <div className={styles.inner}>
                <p>Receiving "File name" (16mb) from Generous Deer</p>
                <span>Sent 1mb of 16mb (15kbps)</span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.innerProgress} />
            </div>
        </div>
    )
}

type UploadProps = {
    fileName: string
    peerName: string
    fileSize: number
    dataTransferred: number
}
function UploadProgress(props: UploadProps) {
    const size = props.fileSize.toLocaleString("en-GB", {
        notation: "compact",
        compactDisplay: "short",
    })
    const sizeSent = props.dataTransferred.toLocaleString("en-GB", {
        notation: "compact",
        compactDisplay: "short",
    })

    const progressPercentage = Math.floor((props.dataTransferred / props.fileSize) * 100)

    return (
        <div className={styles.downloadProgress}>
            <div className={styles.inner}>
                <p>
                    Tranferring{" "}
                    <span>
                        {props.fileName} ({size}b)
                    </span>{" "}
                    to <span>{props.peerName}</span>
                </p>

                <span>
                    Sent <b>{sizeSent}b</b> of <b>{size}b</b>
                </span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.innerProgress} style={{ width: `${progressPercentage}%` }} />
            </div>
        </div>
    )
}
