import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { SOCKET_EVENTS } from "consts"
import { HomePage } from "./Home"

type User = {
    name: string
    avatar: string
    id: string
}

const socket = io("/", { transports: ["websocket"] })

export function Home() {
    const [activeUsers, setActiveUsers] = useState<User[]>([])
    const [socketId, setSocketId] = useState("")

    useEffect(() => {
        socket.on("connect", () => {
            setSocketId(socket.id)
        })

        socket.on(SOCKET_EVENTS.UPDATE_USER_LIST, (data: any) => {
            console.log("received user list")
            console.log(data)
            setActiveUsers(activeUsers.concat(data.users))
        })
    }, [])

    const me = activeUsers.find((user) => user.id === socketId)
    const peers = activeUsers.filter((user) => user.id !== socketId)

    return <HomePage me={me} peers={peers} />
}
