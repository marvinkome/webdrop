import os from "os"
import express from "express"
import { createServer } from "http"
import next from "next"
import { handleSockets } from "./sockets"

const app = express()
const server = createServer(app)

const dev = process.env.NODE_ENV !== "production"
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

handleSockets(server)
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
