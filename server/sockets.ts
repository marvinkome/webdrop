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

        // listeners
        socket.on(SOCKET_EVENTS.SEND_OFFER, (data: any) => {
            socket.to(data.to).emit(SOCKET_EVENTS.RECEIVE_OFFER, {
                offer: data.offer,
                socketId: socket.id,
            })
        })

        socket.on(SOCKET_EVENTS.SEND_ICE_CANDIDATE, (data: any) => {
            socket.to(data.to).emit(SOCKET_EVENTS.RECEIVE_ICE_CANDIDATE, {
                ice: data.ice,
                socketId: socket.id,
            })
        })

        socket.on(SOCKET_EVENTS.SEND_ANSWER, (data: any) => {
            socket.to(data.to).emit(SOCKET_EVENTS.RECEIVE_ANSWER, {
                answer: data.answer,
                socketId: socket.id,
            })
        })

        socket.on("disconnect", () => {
            activeUsers = activeUsers.filter((user) => user.id !== socket.id)
            io.emit(SOCKET_EVENTS.UPDATE_USER_LIST, {
                users: activeUsers,
            })
        })
    })
}
