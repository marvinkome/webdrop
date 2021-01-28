import { SOCKET_EVENTS } from "consts"
import { handleFileUpload } from "utils"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

export type User = {
    name: string
    avatar: string
    id: string
}

export type TransferDetails = {
    fileName: string
    fileSize: number
    peerId: string
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
    const [connectingPeers, setConnectingPeers] = useState<string[]>([])
    const [connectedPeers, setConnectedPeers] = useState<string[]>([])

    // create peerConnection when component mounts on both ends
    useEffect(() => {
        const peerConnection = new RTCPeerConnection({})
        setPeerConnection(peerConnection)
    }, [])

    // create function to call the receiver
    const makeConnection = async (socketId: string) => {
        if (!peerConnection) return

        // create and store data channel for connection
        const dataChannel = peerConnection.createDataChannel(`Connection with ${socketId}`)

        // create offer for receiver
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(new RTCSessionDescription(offer))

        // send offer to receiver
        socket.emit(SOCKET_EVENTS.SEND_OFFER, { offer, to: socketId })
        setConnectingPeers(connectingPeers.concat(socketId))

        // receive answer from receiver
        socket.on(SOCKET_EVENTS.RECEIVE_ANSWER, async (data: any) => {
            if (data.answer) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
        })

        // send ice candidate to receiver
        peerConnection.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, {
                    ice: event.candidate,
                    to: socketId,
                })
            }
        })

        // mark peer as connected when connection status changes
        peerConnection.addEventListener("connectionstatechange", () => {
            if (peerConnection.connectionState === "connected") {
                setConnectingPeers(connectingPeers.filter((peer) => peer === socketId))
                setConnectedPeers(connectedPeers.concat(socketId))
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
                setConnectingPeers(connectingPeers.concat(data.socketId))
            }

            // mark peer as connected when connection status changes
            peerConnection?.addEventListener("connectionstatechange", () => {
                if (peerConnection.connectionState === "connected") {
                    setConnectingPeers(connectingPeers.filter((peer) => peer === data.socketId))
                    setConnectedPeers(connectedPeers.concat(data.socketId))
                }
            })
        })

        // receive ice candidate to caller
        socket.on(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, async (data: any) => {
            if (data.ice) {
                peerConnection?.addIceCandidate(data.ice)
            }
        })
    }, [peerConnection])

    return {
        makeConnection,
        peerConnection,
        connectingPeers,
        connectedPeers,
    }
}

export function useFileUpload(peerConnection: RTCPeerConnection | null) {
    const [transferDetails, setTransferDetails] = useState<TransferDetails | null>(null)
    const [offset, setOffset] = useState(0)
    const [state, setState] = useState<"uploading" | "downloading" | null>(null)

    const uploadFile = (peerId: string, dataChannel?: RTCDataChannel, file?: File) => {
        if (!file || !peerConnection || !dataChannel) {
            console.log("File or connection not available")
            return
        }

        dataChannel.addEventListener("open", () => {
            // send file details
            const fileDetails = [file.name, file.size].join(" ")
            console.log(fileDetails)
            dataChannel.send(fileDetails)

            // store file details in state
            setTransferDetails({
                fileName: file.name,
                fileSize: file.size,
                peerId,
            })

            // upload file
            setState("uploading")

            // update download
            // const fileReader = handleFileUpload(file, dataChannel, peerConnection)
            // fileReader.addEventListener("load", (e) => {
            //     setOffset(offset + (e.target?.result as ArrayBuffer).byteLength)
            // })
        })
    }

    // listen for data as receiver
    useEffect(() => {
        if (!peerConnection) return

        const handleReceivingData = (e: MessageEvent<any>) => {
            setState("downloading")
            console.log(e.data)
        }

        peerConnection?.addEventListener("datachannel", (event) => {
            const dataChannel = event.channel

            // listen for messages
            dataChannel.addEventListener("message", handleReceivingData)
        })
    }, [peerConnection])

    return {
        uploadFile,
        transferDetails,
        dataTransferred: offset,
        fileState: state,
    }
}
