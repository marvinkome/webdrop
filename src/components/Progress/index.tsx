import { TransferDetails } from "containers/home/hooks"
import styles from "./style.module.scss"

type ProgressProps = {
    transferDetails: TransferDetails
    peerName: string
}
export function Progress({ transferDetails, peerName }: ProgressProps) {
    const size = transferDetails.fileSize.toLocaleString("en-GB", {
        notation: "compact",
        compactDisplay: "short",
    })
    const sizeSent = transferDetails.dataTransferred?.toLocaleString("en-GB", {
        notation: "compact",
        compactDisplay: "short",
    })

    const progressPercentage = Math.floor(
        (transferDetails.dataTransferred || 0 / transferDetails.fileSize) * 100
    )

    return (
        <div className={styles.downloadProgress}>
            <div className={styles.inner}>
                <p>
                    {transferDetails.isUploading ? "Tranferring" : "Receiving"}{" "}
                    <span>
                        {transferDetails.fileName} ({size}b)
                    </span>{" "}
                    {transferDetails.isUploading ? "to" : "from"} <span>{peerName}</span>
                </p>

                <span>
                    {transferDetails.isUploading ? "Sent" : "Received"} <b>{sizeSent}b</b> of{" "}
                    <b>{size}b</b>
                </span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.innerProgress} style={{ width: `${progressPercentage}%` }} />
            </div>
        </div>
    )
}
