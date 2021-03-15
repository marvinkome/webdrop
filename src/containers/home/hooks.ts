import Peer from "peerjs"
import { toast } from "react-toastify"
import { SOCKET_EVENTS } from "consts"
import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"
import { FileBuilder, FileSplitter } from "utils/file"

export type User = {
    name: string
    avatar: string
    id: string
}

const socket = io("/", { transports: ["websocket"] })
export function usePeers() {
    const [activeUsers, setActiveUsers] = useState<User[]>([])
    const [socketId, setSocketId] = useState("")
    const [peer, setPeer] = useState<Peer | undefined>()

    useEffect(() => {
        socket.on("connect", async () => {
            setSocketId(socket.id)
            import("peerjs").then(({ default: PeerJS }) => {
                setPeer(new PeerJS(socket.id, { secure: false }))
                console.log("Connection to server established")
            })
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
        peerConn: peer,
        peers: activeUsers.filter((user) => user.id !== socketId),
    }
}

export function useTransfer(peerConn?: Peer) {
    const [transferType, setTransferType] = useState<"upload" | "download">()
    const [transferState, setTransferState] = useState<"starting" | "started" | "stopped">()
    const [transferredSize, setTransferredSize] = useState(0)

    const dataConn = useRef<Peer.DataConnection>()
    const fileBuilder = useRef<FileBuilder>()

    function sendFile(file: File) {
        console.log(
            `[send-file] File is ${[file.name, file.size, file.type, file.lastModified].join(" ")}`
        )

        if (file.size === 0) {
            // toast message
            toast.error("File is empty, please select a non-empty file")
            dataConn.current?.close()
            return
        }

        const fileDetails = JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
        })
        dataConn.current?.send(fileDetails)

        new FileSplitter(file, {
            onFileSplit: (chunk) => {
                if (transferState !== "started") setTransferState("started")
                dataConn.current?.send(chunk)
            },
            onOffsetUpdated: (offset) => {
                setTransferredSize(Math.floor((offset / file.size) * 100))
                if (offset >= file.size) setTransferState("stopped")
            },
        })
    }

    function receiveFile(data: any) {
        if (typeof data === "string") {
            console.log("[receiveFile] Receive file details", data)
            fileBuilder.current = new FileBuilder(JSON.parse(data))
            return
        }

        if (transferState !== "started") setTransferState("started")

        fileBuilder.current?.addChunk(
            data,
            (size) => {
                setTransferredSize(size)
            },
            () => {
                setTransferState("stopped")
            }
        )
    }

    function createConnection(peerId: string, file?: File) {
        if (!peerConn) {
            console.log("[useTransfer] client PeerJS connected to server")
            return
        }

        if (!file) {
            console.log("[useTransfer] no file to be transferred")
            return
        }

        setTransferType("upload")
        dataConn.current = peerConn.connect(peerId)
        dataConn.current.on("open", () => {
            setTransferState("starting")

            // send file to receiver
            sendFile(file)
        })
    }

    useEffect(() => {
        if (!peerConn) {
            console.log("[connectionListener] peerConn not yet available")
            return
        }

        console.log("[connectionListener] peerConn available")
        peerConn.on("connection", (conn) => {
            setTransferType("download")
            dataConn.current = conn

            conn.on("open", () => {
                setTransferState("starting")
                conn.on("data", receiveFile)
            })
        })
    }, [peerConn])

    return {
        createConnection,

        transferType,
        transferState,
        transferredSize,
    }
}
