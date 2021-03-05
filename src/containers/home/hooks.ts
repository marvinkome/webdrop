import Peer from "peerjs"
import { toast } from "react-toastify"
import { SOCKET_EVENTS } from "consts"
import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"

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
                setPeer(new PeerJS(socket.id))
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
    const [transferredSize, setTransferredSize] = useState(0)

    const dataConn = useRef<Peer.DataConnection>()

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

        dataConn.current?.send(
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
            console.log("[read-file] FileRead.onload", e)

            dataConn.current?.send(e.target?.result as string)
            offset += (e.target?.result as ArrayBuffer).byteLength

            setTransferredSize(Math.floor((offset / file.size) * 100))

            if (offset < file.size) {
                readSlice(offset)
            }
        })

        readSlice(0)
    }

    async function createConnection(peerId: string, file?: File) {
        if (!peerConn) {
            console.log("[useTransfer] client PeerJS connected to server")
            return
        }

        if (!file) {
            console.log("[useTransfer] no file to be transferred")
            return
        }

        dataConn.current = peerConn.connect(peerId)
        dataConn.current.on("open", () => {
            // send file to receiver
            sendFile(file)
        })
    }

    useEffect(() => {
        if (!peerConn) {
            console.log("[connectionListener] no connection to sender")
            return
        }

        peerConn.on("connection", (conn) => {
            dataConn.current = conn

            conn.on("open", () => {
                conn.on("data", (data) => {
                    // use data from sender
                    console.log(data)
                })
            })
        })
    }, [peerConn])

    return {
        createConnection,
    }
}
