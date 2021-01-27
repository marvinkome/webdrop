import { HomePage } from "./Home"
import { useSocket, useRTC } from "./hooks"

export function Home() {
    const { me, peers } = useSocket()
    const callUser = useRTC()

    return (
        <HomePage me={me} peers={peers} onSelectFile={(peerId, file) => callUser(peerId, file)} />
    )
}
