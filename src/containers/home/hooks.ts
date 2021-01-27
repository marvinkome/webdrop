import { SOCKET_EVENTS } from "consts"
import { useEffect, useState } from "react"
import { io } from "socket.io-client"

type User = {
    name: string
    avatar: string
    id: string
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

    // create peerConnection when component mounts
    useEffect(() => {
        const peerConnection = new RTCPeerConnection({})
        setPeerConnection(peerConnection)
    }, [])

    // receive call events
    useEffect(() => {
        if (!peerConnection) return

        socket.on(SOCKET_EVENTS.RECEIVE_OFFER, async (data: any) => {
            if (data.offer) {
                await peerConnection?.setRemoteDescription(new RTCSessionDescription(data.offer))

                const answer = await peerConnection?.createAnswer()
                await peerConnection?.setLocalDescription(new RTCSessionDescription(answer))

                socket.emit(SOCKET_EVENTS.SEND_ANSWER, { answer, to: data.socketId })
                setConnectingPeers(connectingPeers.concat(data.socketId))
            }

            peerConnection?.addEventListener("connectionstatechange", () => {
                if (peerConnection.connectionState === "connected") {
                    console.log("Peer Connected")
                    setConnectingPeers(connectingPeers.filter((peer) => peer === data.socketId))
                    setConnectedPeers(connectedPeers.concat(data.socketId))
                }
            })
        })

        socket.on(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, async (data: any) => {
            if (data.ice) {
                peerConnection?.addIceCandidate(data.ice)
            }
        })
    }, [peerConnection])

    // handle data receive
    useEffect(() => {
        if (!peerConnection) return

        // get data channel
        peerConnection?.addEventListener("datachannel", (event) => {
            const dataChannel = event.channel

            // listen for messages
            dataChannel.addEventListener("message", (e) => {
                console.log(e.data)
            })
        })
    }, [peerConnection])

    async function makeCall(socketId: string, file?: File) {
        const dataChannel = peerConnection?.createDataChannel("socket-channel")

        // handle offers
        const offer = await peerConnection?.createOffer()
        await peerConnection?.setLocalDescription(new RTCSessionDescription(offer))

        // send offer
        socket.emit(SOCKET_EVENTS.SEND_OFFER, { offer, to: socketId })
        setConnectingPeers(connectingPeers.concat(socketId))

        // send ice
        peerConnection?.addEventListener("icecandidate", (event) => {
            if (event.candidate) {
                socket.emit(SOCKET_EVENTS.SEND_ICE_CANDIDATE, {
                    ice: event.candidate,
                    to: socketId,
                })
            }
        })

        // receive offer
        socket.on(SOCKET_EVENTS.RECEIVE_ANSWER, async (data: any) => {
            if (data.answer) {
                await peerConnection?.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
        })

        // listen for connection status
        peerConnection?.addEventListener("connectionstatechange", () => {
            if (peerConnection.connectionState === "connected") {
                setConnectingPeers(connectingPeers.filter((peer) => peer === socketId))
                setConnectedPeers(connectedPeers.concat(socketId))
            }
        })

        // send file data
        dataChannel?.addEventListener("open", () => {
            dataChannel.send("Hello world!")
        })

        // close connection
        // peerConnection?.close()
    }

    return {
        makeCall,
        connectingPeers,
        connectedPeers,
    }
}

export function useFileUpload() {
    const [] = useState()
}
