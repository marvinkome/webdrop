import cls from "classnames"
import styles from "./styles.module.scss"
import { ChangeEvent, useRef } from "react"
import { CircularProgressbarWithChildren } from "react-circular-progressbar"
import { MdCheck } from "react-icons/md"

export function User({ avatar, name }: { avatar: string; name: string }) {
    return (
        <div className={styles.userAvatar}>
            <img src={avatar} alt="My Avatar" />
            <span>{name}</span>
        </div>
    )
}

type PeerProps = {
    avatar: string
    name: string
    transferData: {
        transferType?: "upload" | "download"
        transferredSize: number
        bitrate: number | null
        transferState?: "starting" | "started" | "stopped"
    }
    onSelectFile: (file?: File) => void
}
export function Peer({ avatar, name, onSelectFile, transferData }: PeerProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        e.preventDefault()

        const files = e.target.files || []
        const file = files[0]

        onSelectFile(file)
    }

    const circularProgressStyles = {
        root: { width: "85px" },
        path: { stroke: "#27ae60" },
    }

    const imgClassname = cls({
        [styles.bordered]: transferData.transferState === undefined,
        [styles.connecting]: transferData.transferState === "starting",
    })

    let image = (
        <img
            className={imgClassname}
            src={avatar}
            alt={name}
            onClick={() => fileInputRef.current?.click()}
        />
    )

    if (transferData.transferState === "started") {
        image = (
            <CircularProgressbarWithChildren
                styles={circularProgressStyles}
                value={transferData.transferredSize}
            >
                <img src={avatar} alt={name} onClick={() => fileInputRef.current?.click()} />
            </CircularProgressbarWithChildren>
        )
    }

    if (transferData.transferState === "stopped") {
        image = (
            <CircularProgressbarWithChildren
                styles={circularProgressStyles}
                value={transferData.transferredSize}
            >
                <img src={avatar} alt={name} onClick={() => fileInputRef.current?.click()} />

                <div className={styles.completedOverlay}>
                    <MdCheck className={styles.icon} />
                </div>
            </CircularProgressbarWithChildren>
        )
    }

    return (
        <div className={styles.peerAvatar}>
            {image}

            <span>
                {transferData.transferState !== "started"
                    ? name
                    : transferData.transferType === "download"
                    ? `${transferData.bitrate} kbits/sec`
                    : name}
            </span>

            <input
                type="file"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={onFileChange}
            />
        </div>
    )
}
