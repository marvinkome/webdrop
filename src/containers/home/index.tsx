import { HomePage } from "./Home"
import { useSocket } from "./hooks"

export function Home() {
    const { me, peers } = useSocket()
    // const { makeConnection, ...rtcData } = useRTC()
    // const { uploadFile, ...transferInfo } = useFileUpload(rtcData.peerConnection)

    const onSelectFile = async (peerId: string, file?: File) => {
        // when user is ready to send file, make a connection with the peer
        // let dataChannel = await makeConnection(peerId)
        // uploadFile(peerId, dataChannel!, file)
    }

    return (
        <HomePage
            me={me}
            peers={peers}
            connectionStats={[]}
            transferDetails={[]}
            onSelectFile={onSelectFile}
        />
    )
}
