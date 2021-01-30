import { TransferDetails } from "containers/home/hooks"
import { fileSize } from "utils"
import styles from "./style.module.scss"

type ProgressProps = {
    transferDetails: TransferDetails
    peerName: string
}
export function Progress({ transferDetails, peerName }: ProgressProps) {
    const size = fileSize(transferDetails.fileSize)
    const sizeSent = fileSize(transferDetails.dataTransferred)
    const bitrate = fileSize(transferDetails.transferSpeed)

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
                    <b>{size}b</b> {bitrate && <b>{bitrate}bps</b>}
                </span>
            </div>

            <div className={styles.progressBar}>
                <div className={styles.innerProgress} style={{ width: `${progressPercentage}%` }} />
            </div>
        </div>
    )
}
