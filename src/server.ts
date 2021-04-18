import express from "express"
import { createServer } from "http"
import next from "next"
import { ExpressPeerServer } from "peer"

const app = express()
const server = createServer(app)

const dev = process.env.NODE_ENV !== "production"
const port = process.env.PORT || 8081
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()

const peerServer = ExpressPeerServer(server, {
    path: "/peer",
})

app.use("/api", peerServer)

nextApp.prepare().then(() => {
    app.get("*", (req, res) => {
        return handle(req, res)
    })

    server.listen(port, () => {
        console.log(`Ready! on localhost:${port}`)
    })
})
