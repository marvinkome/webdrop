import { SOCKET_EVENTS } from "consts"
import { dowloadUrl, fileSize } from "utils"
import { toast } from "react-toastify"
import { useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

export type User = {
    name: string
    avatar: string
    id: string
}

type FileDetails = {
    fileName: string
    fileSize: number
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
    const [transferType, setTransferType] = useState<"upload" | "download">()
    const [transferState, setTransferState] = useState<"starting" | "started" | "stopped">()
    const [transferredSize, setTransferredSize] = useState(0)
    const [bitrate, setBitrate] = useState<number | null>(null)

    // refs
    const localConnection = useRef<RTCPeerConnection>()
    const remoteConnection = useRef<RTCPeerConnection>()

    const sendChannel = useRef<RTCDataChannel>()
    const receiveChannel = useRef<RTCDataChannel>()

    const channelOpen = useRef(false)
    const receiveBuffer = useRef<any[]>([])
    const receiveSize = useRef<number>(0)
    const receivingFileDetails = useRef<FileDetails>()

    const bytesPrev = useRef(0)
    const timestampStart = useRef(0)
    const timestampPrev = useRef(0)
    const statsInterval = useRef<any>()

    // functions
    async function createRemoteConnection(socketId: string) {
        setTransferState("starting")
        setTransferType("download")

        const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
        remoteConnection.current = new RTCPeerConnection(configuration)
        console.log("[remote-rtc] Created remote peer connection")

        remoteConnection.current.addEventListener("icecandidate", async (e) => {
            console.log("[remote-rtc] ICE candidate from remoteConnection: ", e.cancelable)
            socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, { ice: e.candidate, to: socketId })
        })

        remoteConnection.current.addEventListener("datachannel", receiveChannelCb)
    }

    async function createLocalConnection(socketId: string, file: File) {
        setTransferState("starting")
        setTransferType("upload")

        const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
        localConnection.current = new RTCPeerConnection(configuration)
        console.log("[local-rtc] Created local peer connection")

        sendChannel.current = localConnection.current.createDataChannel("")
        sendChannel.current.binaryType = "arraybuffer"
        console.log("[local-rtc] Created send data channel")

        localConnection.current.addEventListener("connectionstatechange", (e) => {
            if (!["connected", "new"].includes(localConnection.current?.connectionState as any)) {
                setTransferState("stopped")
            }
        })
        sendChannel.current.addEventListener("open", () => onSendChannelStateChange(file))
        sendChannel.current.addEventListener("close", () => onSendChannelStateChange(file))
        sendChannel.current.addEventListener("error", (e) => onError(e))

        localConnection.current.addEventListener("icecandidate", async (e) => {
            console.log("[local-rtc] Local ICE candidate:", e.candidate)
            socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, { ice: e.candidate, to: socketId })
        })

        const offer = await localConnection.current.createOffer()
        localConnection.current.setLocalDescription(offer)
        console.log("[local-rtc] Offer from localConnection: ", offer.sdp)
        socket.emit(SOCKET_EVENTS.SEND_OFFER, { offer, to: socketId })
    }

    function closeDataChannels() {
        sendChannel.current?.close()
        sendChannel.current = undefined

        receiveChannel.current?.close()
        receiveChannel.current = undefined

        console.log("[close-connections] Closed data channels")

        localConnection.current?.close()
        remoteConnection.current?.close()

        localConnection.current = undefined
        remoteConnection.current = undefined
        console.log("[close-connections] Closed peer connections")

        setTransferState("stopped")
    }

    function sendData(file: File) {
        console.log(
            `[send-file] File is ${[file.name, file.size, file.type, file.lastModified].join(" ")}`
        )

        if (file.size === 0) {
            // toast message
            toast.error("File is empty, please select a non-empty file")
            closeDataChannels()
            return
        }

        // send file details
        sendChannel.current?.send(
            JSON.stringify({
                fileName: file.name,
                fileSize: file.size,
            })
        )

        const chunkSize = 16384
        let offset = 0
        let fileReader = new FileReader()

        const readSlice = (o: number) => {
            console.log("[read-slice] readSlice: ", o)
            const slice = file.slice(offset, o + chunkSize)
            fileReader.readAsArrayBuffer(slice)
        }

        fileReader.addEventListener("error", (error) => console.error("Error reading file:", error))
        fileReader.addEventListener("abort", (event) => console.log("File reading aborted:", event))
        fileReader.addEventListener("load", (e) => {
            if (!channelOpen.current) return

            console.log("[read-file] FileRead.onload", e)
            setTransferState("started")

            sendChannel.current?.send(e.target?.result as string)
            offset += (e.target?.result as ArrayBuffer).byteLength

            setTransferredSize(Math.floor((offset / file.size) * 100))

            if (offset < file.size) {
                readSlice(offset)
            }
        })

        readSlice(0)
    }

    // callbacks
    function receiveChannelCb(event: RTCDataChannelEvent) {
        console.log("[remote-channel] Receive Channel Callback")
        receiveChannel.current = event.channel
        receiveChannel.current.binaryType = "arraybuffer"

        receiveChannel.current.onmessage = onReceiveMessageCb
        receiveChannel.current.onopen = onReceiveChannelStateChange
        receiveChannel.current.onclose = onReceiveChannelStateChange
        receiveChannel.current.onerror = onError
    }

    function onReceiveMessageCb(event: MessageEvent) {
        if (typeof event.data === "string") {
            console.log("[remote-channel] Receive file stats", event.data)
            receivingFileDetails.current = JSON.parse(event.data)
            return
        }

        transferState !== "started" && setTransferState("started")

        console.log("[remote-channel] Receive Message", event.data.byteLength)
        receiveBuffer.current?.push(event.data)
        receiveSize.current += event.data.byteLength

        setTransferredSize(
            Math.floor((receiveSize.current / (receivingFileDetails.current?.fileSize || 0)) * 100)
        )

        // track when download is complete
        // console.log(receivingFileDetails.current?.fileSize, receiveSize.current)
        if (receivingFileDetails.current?.fileSize === receiveSize.current) {
            console.log(receiveBuffer.current)
            const received = new Blob(receiveBuffer.current)
            receiveBuffer.current = []

            dowloadUrl(URL.createObjectURL(received), receivingFileDetails.current.fileName)

            const bitrate = Math.round(
                (receiveSize.current * 8) / (new Date().getTime() - timestampStart.current)
            )
            toast.success(
                `${receivingFileDetails.current.fileName} - Speed (${fileSize(bitrate)}bits/sec)`
            )
            console.log("[remote-channel] File downloaded in")

            if (statsInterval.current) {
                clearInterval(statsInterval.current)
                statsInterval.current = null
            }

            closeDataChannels()
        }
    }

    function onSendChannelStateChange(file: File) {
        if (!sendChannel.current) return
        const { readyState } = sendChannel.current
        console.log(`[local-channel] Send channel state is: ${readyState}`)
        channelOpen.current = readyState === "open"

        if (readyState === "open") {
            console.log("[local-channel] Send data")
            sendData(file)
        }

        if (readyState === "closed") {
            setTransferState("stopped")
        }
    }

    function onError(error: any) {
        if (receiveChannel.current) {
            console.error("[remote-channel] Error in receiveChannel:", error)
            return
        }

        if (sendChannel.current) {
            console.error("[local-channel] Error in sendChannel:", error)
            return
        }

        console.log("[local-channel] Error in sendChannel which is already closed:", error)
    }

    async function onReceiveChannelStateChange() {
        if (!receiveChannel.current) return
        const readyState = receiveChannel.current.readyState
        console.log(`[remote-channel] Receive channel state is: ${readyState}`)

        if (readyState === "open") {
            timestampStart.current = new Date().getTime()
            timestampPrev.current = timestampStart.current
            statsInterval.current = setInterval(displayStats, 500)
            await displayStats()
        }

        if (readyState === "closed") {
            setTransferState("stopped")
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
            console.log(`[displayStats] Bitrate ${bitrate}`)

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

            if (ice) {
                console.log("[remote-rtc] ICE candidate from localConnection:", ice)
                await remoteConnection.current?.addIceCandidate(ice)
            }
        })

        socket.on(SOCKET_EVENTS.RECEIVE_OFFER, async ({ offer, socketId }: any) => {
            if (!remoteConnection.current) {
                await createRemoteConnection(socketId)
            }

            console.log("[remote-rtc] Offer from localConnection: ", offer?.sdp)
            await remoteConnection.current?.setRemoteDescription(offer)

            const answer = await remoteConnection.current?.createAnswer()
            await remoteConnection.current?.setLocalDescription(answer!)
            console.log("[remote-rtc] Answer from remoteConnection: ", answer?.sdp)
            socket.emit(SOCKET_EVENTS.SEND_ANSWER, { answer, to: socketId })
        })
    }, [])

    // local socket listeners
    useEffect(() => {
        socket.on(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, async (data: any) => {
            if (remoteConnection.current) return
            if (data.ice) {
                console.log("[local-rtc] Remote ICE candidate: ", data.ice)
                localConnection.current?.addIceCandidate(data.ice)
            }
        })

        socket.on(SOCKET_EVENTS.RECEIVE_ANSWER, async ({ answer }: any) => {
            if (remoteConnection.current) return
            await localConnection.current?.setRemoteDescription(answer)
            console.log("[local-rtc] Answer from remoteConnection: ", answer?.sdp)
        })
    }, [])

    return {
        // actions
        createLocalConnection,

        // data
        transferType,
        transferredSize,
        bitrate,
        transferState,
    }
}
