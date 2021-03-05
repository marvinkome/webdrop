import { HomePage } from "./Home"
import { usePeers, useTransfer } from "./hooks"

export function Home() {
    const { me, peers, peerConn } = usePeers()
    const { createConnection, ...transferData } = useTransfer(peerConn)

    const onSelectFile = (peerId: string, file?: File) => {
        if (!file) return
        createConnection(peerId, file)
    }

    return (
        <HomePage me={me} peers={peers} onSelectFile={onSelectFile} transferData={transferData} />
    )
}
