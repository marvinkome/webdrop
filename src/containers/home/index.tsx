import { HomePage } from "./Home"
import { useRTCTransfer, useSocket } from "./hooks"

export function Home() {
    const { me, peers } = useSocket()
    const { createLocalConnection, ...transferData } = useRTCTransfer()

    const onSelectFile = async (peerId: string, file?: File) => {
        if (!file) return
        await createLocalConnection(peerId, file)
    }

    return (
        <HomePage me={me} peers={peers} onSelectFile={onSelectFile} transferData={transferData} />
    )
}
