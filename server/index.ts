import os from "os"
import express from "express"
import { Server as IOServer } from "socket.io"
import { createServer } from "http"
import next from "next"
import { SOCKET_EVENTS } from "../consts/index"

const app = express()
const server = createServer(app)
const io = new IOServer(server)

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const activeSockets: string[] = []
io.on("connection", (socket) => {
    console.log("Socket Connected")

    const alreadyConnected = activeSockets.includes(socket.id)
    if (!alreadyConnected) {
        activeSockets.push(socket.id)

        socket.emit(SOCKET_EVENTS.UPDATE_USER_LIST, {
            users: activeSockets.filter((user) => user !== socket.id),
        })

        socket.broadcast.emit(SOCKET_EVENTS.UPDATE_USER_LIST, {
            users: [socket.id],
        })
    }
})

nextApp.prepare().then(() => {
    app.get("*", (req, res) => {
        return handle(req, res)
    })

    server.listen(3000, () => {
        const networkInterface = os.networkInterfaces()
        const ip = networkInterface["en0"] ? networkInterface["en0"][1].address : ""

        console.log(`Ready! on ${ip}:3000`)
    })
})
