import { HomePage } from "./Home"
import { useSocket, useRTC } from "./hooks"

export function Home() {
    const { me, peers } = useSocket()
    const { makeCall, connectingPeers, connectedPeers } = useRTC()

    return (
        <HomePage
            me={me}
            peers={peers}
            connectingPeers={connectingPeers}
            connectedPeers={connectedPeers}
            onSelectFile={(peerId, file) => makeCall(peerId, file)}
        />
    )
}
