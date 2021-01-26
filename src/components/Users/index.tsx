import { ChangeEvent, useRef } from "react"
import styles from "./styles.module.scss"

export function User({ avatar, name }: { avatar: string; name: string }) {
    return (
        <div className={styles.userAvatar}>
            <img src={avatar} alt="My Avatar" />
            <span>{name}</span>
        </div>
    )
}

type PeerProps = { avatar: string; name: string; onSelectFile: (file?: File) => void }
export function Peer({ avatar, name, onSelectFile }: PeerProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        e.preventDefault()

        const files = e.target.files || []
        const file = files[0]

        onSelectFile(file)
    }

    return (
        <div className={styles.peerAvatar}>
            <img src={avatar} alt="Peer Avatar" onClick={() => fileInputRef.current?.click()} />

            <span>{name}</span>
            <input
                type="file"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={onFileChange}
            />
        </div>
    )
}
