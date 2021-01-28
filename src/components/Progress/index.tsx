import styles from "./style.module.scss"

type ProgressProps = {
    fileName: string
    peerName: string
    fileSize: number
    dataTransferred: number
    fileState: "uploading" | "downloading" | null
}
export function Progress({ fileState, ...props }: ProgressProps) {
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
                    {fileState === "downloading" ? "Receiving" : "Tranferring"}{" "}
                    <span>
                        {props.fileName} ({size}b)
                    </span>{" "}
                    {fileState === "downloading" ? "from" : "to"} <span>{props.peerName}</span>
                </p>

                <span>
                    {fileState === "downloading" ? "Received" : "Sent"} <b>{sizeSent}b</b> of{" "}
                    <b>{size}b</b>
                </span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.innerProgress} style={{ width: `${progressPercentage}%` }} />
            </div>
        </div>
    )
}
