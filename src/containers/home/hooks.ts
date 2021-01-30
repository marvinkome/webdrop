import { SOCKET_EVENTS } from "consts"
import { handleFileUpload, dowloadUrl } from "utils"
import { useEffect, useState } from "react"
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

export function useRTC() {
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
    const [connectionStats, setConnectionStats] = useState<ConnectionStats[]>([])

    // create peerConnection when component mounts on both ends
    useEffect(() => {
        const peerConnection = new RTCPeerConnection({})
        setPeerConnection(peerConnection)
    }, [])

    // create function to call the receiver
    const makeConnection = async (socketId: string) => {
        if (!peerConnection) return

        // create and store data channel for connection
        const dataChannel = peerConnection.createDataChannel(`${socket.id}-${socketId}`)

        // create offer for receiver
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer))

        // send offer to receiver
        socket.emit(SOCKET_EVENTS.SEND_OFFER, { offer, to: socketId })
        setConnectionStats((connectionStats) => {
            return connectionStats.concat({
                peerId: socketId,
                status: "connecting",
            })
        })

        // receive answer from receiver
        socket.on(SOCKET_EVENTS.RECEIVE_ANSWER, async (data: any) => {
            if (data.answer) {
                console.log("send remote")
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
        })

        // send ice candidate to receiver
        peerConnection.addEventListener("icecandidate", (event) => {
            console.log("send ice", event.candidate)
            if (event.candidate) {
                socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, {
                    ice: event.candidate,
                    to: socketId,
                })
            }
        })

        // receive ice candidate from receiver
        socket.on(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, async (data: any) => {
            if (data.ice) {
                peerConnection?.addIceCandidate(data.ice)
            }
        })

        // mark peer as connected when connection status changes
        peerConnection.addEventListener("connectionstatechange", () => {
            console.log("connection", peerConnection.connectionState)
            if (peerConnection.connectionState === "connected") {
                setConnectionStats((connectionStats) => {
                    return connectionStats.map((peer) => {
                        if (peer.peerId === socketId) {
                            return { ...peer, status: "connected" as any }
                        }

                        return peer
                    })
                })
            }
        })

        return dataChannel
    }

    // receive call events as receiver
    useEffect(() => {
        if (!peerConnection) return

        socket.on(SOCKET_EVENTS.RECEIVE_OFFER, async (data: any) => {
            if (data.offer) {
                // set offer
                await peerConnection?.setRemoteDescription(new RTCSessionDescription(data.offer))

                // create answer for caller
                const answer = await peerConnection?.createAnswer()
                await peerConnection?.setLocalDescription(new RTCSessionDescription(answer))

                // send answer to caller
                socket.emit(SOCKET_EVENTS.SEND_ANSWER, { answer, to: data.socketId })
                setConnectionStats((connectionStats) => {
                    return connectionStats.concat({
                        peerId: data.socketId,
                        status: "connecting",
                    })
                })
            }

            // send ice candidate to caller
            peerConnection.addEventListener("icecandidate", (event) => {
                console.log("send ice", event.candidate)
                if (event.candidate) {
                    socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, {
                        ice: event.candidate,
                        to: data.socketId,
                    })
                }
            })

            // mark peer as connected when connection status changes
            peerConnection?.addEventListener("connectionstatechange", () => {
                if (peerConnection.connectionState === "connected") {
                    setConnectionStats((connectionStats) => {
                        return connectionStats.map((peer) => {
                            if (peer.peerId === data.socketId) {
                                return { ...peer, status: "connected" as any }
                            }

                            return peer
                        })
                    })
                }
            })
        })

        // receive ice candidate from caller
        socket.on(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, async (data: any) => {
            if (data.ice) {
                peerConnection?.addIceCandidate(data.ice)
            }
        })
    }, [peerConnection])

    return {
        makeConnection,
        peerConnection,
        connectionStats,
    }
}

export function useFileUpload(peerConnection: RTCPeerConnection | null) {
    const [transferDetails, setTransferDetails] = useState<TransferDetails[]>([])

    const uploadFile = (peerId: string, dataChannel?: RTCDataChannel, file?: File) => {
        if (!file || !peerConnection || !dataChannel) {
            console.log("File or connection not available")
            return
        }

        dataChannel.addEventListener("open", () => {
            const details = {
                fileName: file.name,
                fileSize: file.size,
                peerId,
                isUploading: true,
            }

            // send file details
            dataChannel.send(JSON.stringify(details))

            // store file details in state
            setTransferDetails((transferDetails) => transferDetails.concat(details))

            // update download
            handleFileUpload(file, dataChannel, peerConnection, (offset) => {
                setTransferDetails((transferDetails) => {
                    return transferDetails.map((d) => {
                        if (d.peerId === peerId) {
                            return { ...d, dataTransferred: offset }
                        }

                        return d
                    })
                })
            })
        })
    }

    // listen for data as receiver
    useEffect(() => {
        if (!peerConnection) return

        peerConnection?.addEventListener("datachannel", (event) => {
            const dataChannel = event.channel
            let details: TransferDetails
            let receiveBuffer: any[] = []
            let localOffset: number = 0

            // listen for messages
            dataChannel.addEventListener("message", (e: MessageEvent<any>) => {
                const caller = dataChannel.label.split("-")[0]
                const data = e.data

                // handle file details
                if (typeof data === "string") {
                    details = JSON.parse(data)
                    details.peerId = caller
                    details.isUploading = false

                    // store transferDetails for UI
                    setTransferDetails((transferDetails) => transferDetails.concat(details))
                    return
                }

                // store file
                receiveBuffer.push(data)
                localOffset = localOffset + data.byteLength

                // set dataTransferred for UI
                setTransferDetails((transferDetails) => {
                    return transferDetails.map((d) => {
                        if (d.peerId === caller) {
                            return { ...d, dataTransferred: localOffset }
                        }

                        return d
                    })
                })

                console.log({ details })
                if (localOffset === details?.fileSize) {
                    const received = new Blob(receiveBuffer)
                    receiveBuffer = []

                    const url = URL.createObjectURL(received)
                    dowloadUrl(url, details.fileName)
                    URL.revokeObjectURL(url)
                }
            })
        })
    }, [peerConnection])

    return {
        uploadFile,
        transferDetails,
    }
}
