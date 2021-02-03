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

    server.listen(process.env.PORT || 3000, () => {
        console.log(`Ready! on localhost:3000`)
    })
})
