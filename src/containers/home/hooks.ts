import { SOCKET_EVENTS } from "consts"
import { handleFileUpload, dowloadUrl } from "utils"
import { toast } from "react-toastify"
import { useCallback, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

export type User = {
    name: string
    avatar: string
    id: string
}

export type ConnectionStats = {
    status?: "connected" | "connecting"
    peerId: string
}

export type TransferDetails = {
    fileName: string
    fileSize: number
    peerId: string
    isUploading?: boolean
    dataTransferred?: number
    transferSpeed?: number
}

const socket = io("/", { transports: ["websocket"] })
export function useSocket() {
    const [activeUsers, setActiveUsers] = useState<User[]>([])
    const [socketId, setSocketId] = useState("")

    useEffect(() => {
        socket.on("connect", () => {
            setSocketId(socket.id)
        })

        socket.on(SOCKET_EVENTS.UPDATE_USER_LIST, (data: any) => {
            setActiveUsers(data.users)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return {
        me: activeUsers.find((user) => user.id === socketId),
        peers: activeUsers.filter((user) => user.id !== socketId),
    }
}

export function useRTCTransfer() {
    // state
    const [bitrate, setBitrate] = useState(0)

    // refs
    const localConnection = useRef<RTCPeerConnection>()
    const remoteConnection = useRef<RTCPeerConnection>()

    const sendChannel = useRef<RTCDataChannel>()
    const receiveChannel = useRef<RTCDataChannel>()

    const receiveBuffer = useRef<any[]>()
    const receiveSize = useRef<number>()

    const bytesPrev = useRef(0)
    const timestampStart = useRef(0)
    const timestampPrev = useRef(0)
    const statsInterval = useRef<any>()

    // functions
    async function createRemoteConnection(socketId: string) {
        remoteConnection.current = new RTCPeerConnection()
        console.log("Created remote peer connection")

        remoteConnection.current.addEventListener("icecandidate", async (e) => {
            console.log("Remote ICE candidate: ", e.cancelable)
            socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, { ice: e.candidate, to: socketId })
        })

        remoteConnection.current.addEventListener("datachannel", receiveChannelCb)
    }

    async function createLocalConnection(socketId: string, file: File) {
        localConnection.current = new RTCPeerConnection()
        console.log("Created local peer connection")

        sendChannel.current = localConnection.current.createDataChannel("")
        sendChannel.current.binaryType = "arraybuffer"
        console.log("Created send data channel")

        sendChannel.current.addEventListener("open", () => onSendChannelStateChange(file))
        sendChannel.current.addEventListener("close", () => onSendChannelStateChange(file))
        sendChannel.current.addEventListener("error", (e) => onError(e))

        localConnection.current.addEventListener("icecandidate", async (e) => {
            console.log("Local ICE candidate: ", e.cancelable)
            socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, { ice: e.candidate, to: socketId })
        })

        const offer = await localConnection.current.createOffer()
        localConnection.current.setLocalDescription(offer)
        console.log("Offer from localConnection: ", offer.sdp)
        socket.emit(SOCKET_EVENTS.SEND_OFFER, { offer, to: socketId })
    }

    function closeDataChannels() {
        sendChannel.current?.close()
        sendChannel.current = undefined

        receiveChannel.current?.close()
        receiveChannel.current = undefined

        console.log("Closed data channels")

        localConnection.current?.close()
        remoteConnection.current?.close()

        localConnection.current = undefined
        remoteConnection.current = undefined
        console.log("Closed peer connections")
    }

    function sendData(file: File) {
        console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(" ")}`)

        if (file.size === 0) {
            // toast message
            toast.error("File is empty, please select a non-empty file")
            closeDataChannels()
            return
        }

        const chunkSize = 16384
        let offset = 0
        let fileReader = new FileReader()

        const readSlice = (o: number) => {
            console.log("readSlice: ", o)
            const slice = file.slice(offset, o + chunkSize)
            fileReader.readAsArrayBuffer(slice)
        }

        fileReader.addEventListener("error", (error) => console.error("Error reading file:", error))
        fileReader.addEventListener("abort", (event) => console.log("File reading aborted:", event))
        fileReader.addEventListener("load", (e) => {
            console.log("FileRead.onload", e)
            sendChannel.current?.send(e.target?.result as string)
            offset += (e.target?.result as ArrayBuffer).byteLength

            if (offset < file.size) {
                readSlice(offset)
            }
        })

        readSlice(0)
    }

    // callbacks
    function receiveChannelCb(event: RTCDataChannelEvent) {
        console.log("Receive Channel Callback")
        receiveChannel.current = event.channel
        receiveChannel.current.binaryType = "arraybuffer"

        receiveChannel.current.onmessage = onReceiveMessageCb
        receiveChannel.current.onopen = onReceiveChannelStateChange
        receiveChannel.current.onclose = onReceiveChannelStateChange
    }

    function onReceiveMessageCb(event: MessageEvent) {
        console.log("Receive Message", event.data.byteLength)
        receiveBuffer.current?.push(event.data)
        receiveSize.current += event.data.byteLength

        // track when download is complete
        closeDataChannels()
    }

    function onSendChannelStateChange(file: File) {
        if (!sendChannel.current) return
        const { readyState } = sendChannel.current
        console.log(`Send channel state is: ${readyState}`)

        if (readyState === "open") {
            sendData(file)
        }
    }

    function onError(error: any) {
        if (sendChannel.current) {
            console.error("Error in sendChannel:", error)
            return
        }

        console.log("Error in sendChannel which is already closed:", error)
    }

    async function onReceiveChannelStateChange() {
        if (!receiveChannel.current) return
        const readyState = receiveChannel.current.readyState
        console.log(`Receive channel state is: ${readyState}`)

        if (readyState === "open") {
            timestampStart.current = new Date().getTime()
            timestampPrev.current = timestampStart.current
            statsInterval.current = setInterval(displayStats, 500)
            await displayStats()
        }
    }

    async function displayStats() {
        if (
            !remoteConnection.current ||
            remoteConnection.current.iceConnectionState !== "connected"
        ) {
            return
        }

        const stats = await remoteConnection.current.getStats()
        let activeCandidatePair: any
        stats.forEach((report) => {
            if (report.type === "transport") {
                activeCandidatePair = stats.get(report.selectedCandidatePairId)
            }
        })

        if (activeCandidatePair) {
            if (timestampPrev === activeCandidatePair.timestamp) return

            // calculate current bitrate
            const bytesNow = activeCandidatePair.bytesReceived
            const bitrate = Math.round(
                ((bytesNow - bytesPrev.current) * 8) /
                    (activeCandidatePair.timestamp - timestampPrev.current)
            )

            setBitrate(bitrate)

            timestampPrev.current = activeCandidatePair.timestamp
            bytesPrev.current = bytesNow
        }
    }

    // remote socket listeners
    useEffect(() => {
        socket.on(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, async ({ ice, socketId }: any) => {
            if (localConnection.current) return
            if (!remoteConnection.current) {
                await createRemoteConnection(socketId)
            }

            console.log("Local ICE candidate: ", ice)
            await remoteConnection.current?.addIceCandidate(ice)
        })

        socket.on(SOCKET_EVENTS.RECEIVE_OFFER, async ({ offer, socketId }: any) => {
            if (!remoteConnection.current) {
                await createRemoteConnection(socketId)
            }

            await remoteConnection.current?.setRemoteDescription(offer)

            const answer = await remoteConnection.current?.createAnswer()
            await remoteConnection.current?.setLocalDescription(answer!)
            console.log("Answer from remoteConnection: ", answer?.sdp)
            socket.emit(SOCKET_EVENTS.SEND_ANSWER, { answer, to: socketId })
        })
    }, [])

    // local socket listeners
    useEffect(() => {
        socket.on(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, async (data: any) => {
            if (data.ice) {
                console.log("Remote ICE candidate: ", data.ice)
                localConnection.current?.addIceCandidate(data.ice)
            }
        })

        socket.on(SOCKET_EVENTS.RECEIVE_ANSWER, async ({ answer }: any) => {
            await localConnection.current?.setRemoteDescription(answer)
            console.log("Answer from remoteConnection: ", answer?.sdp)
        })
    }, [])

    return {
        createLocalConnection,
    }
}
