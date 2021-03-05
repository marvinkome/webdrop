import { Server } from "http"
import { Server as IOServer } from "socket.io"
import { getUserAvatar } from "../src/utils"
import { SOCKET_EVENTS } from "../src/consts/index"

type User = {
    name: string
    avatar: string
    id: string
}

export function handleSockets(server: Server) {
    const io = new IOServer(server)
    let activeUsers: User[] = []

    io.on("connection", (socket) => {
        console.log(`user ${socket.id} connected`)

        const alreadyConnected = activeUsers.find((user) => user.id === socket.id)
        if (!alreadyConnected) {
            const avatar = getUserAvatar()
            const user = {
                name: avatar.label,
                avatar: avatar.url,
                id: socket.id,
            }

            activeUsers.push(user)
            console.log(`${activeUsers.length} Active Users`)

            io.emit(SOCKET_EVENTS.UPDATE_USER_LIST, {
                users: activeUsers,
            })
        }

        socket.on("disconnect", () => {
            activeUsers = activeUsers.filter((user) => user.id !== socket.id)
            io.emit(SOCKET_EVENTS.UPDATE_USER_LIST, {
                users: activeUsers,
            })
        })
    })
}
