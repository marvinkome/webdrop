import Peer from "peerjs"
import { customAlphabet } from "nanoid"
import { useState, useEffect } from "react"
import { useToast } from "@chakra-ui/toast"
import { FileSplitter } from "utils/file"

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const nanoid = customAlphabet(alphabet, 6)

export function useFileTransfer(peer: Peer | null, file: File | null) {
    const [transferStarted, setTransferStarted] = useState(false)
    const [transferCompleted, setTransferCompleted] = useState(false)
    const [transferedSize, setTransferredSize] = useState(0)

    function transferFile(dataConn: Peer.DataConnection) {
        if (!file) return

        // send file details to peer
        const fileDetails = JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
        })

        dataConn.send(fileDetails)

        // send file
        new FileSplitter(file, {
            onFileSplit: (chunk) => {
                setTransferStarted(true)
                dataConn.send(chunk)
            },
            onOffsetUpdated: (offset) => {
                setTransferredSize(Math.floor((offset / file.size) * 100))
                if (offset >= file.size) {
                    setTransferStarted(false)
                    setTransferCompleted(true)
                }
            },
        })
    }

    useEffect(() => {
        const onConnection = (dataConn: Peer.DataConnection) => {
            dataConn.on("open", () => transferFile(dataConn))
        }

        peer?.on("connection", onConnection)
        return () => {
            peer?.off("connection", onConnection)
        }
    }, [peer, file])

    return {
        transferStarted,
        transferCompleted,
        transferedSize,
    }
}

export function useTransferSetup() {
    const toast = useToast({ position: "top-right", isClosable: true })
    const [file, setFile] = useState<File | null>(null)
    const [peer, setPeer] = useState<Peer | null>(null)

    const onSelectFile = async (file: File) => {
        if (file.size === 0) {
            toast({ title: "File empty", description: "Please choose a valid file" })
            return
        }

        setFile(file)

        const { default: PeerJS } = await import("peerjs")
        const code = nanoid()
        const options: any = {}

        if (process.env.NODE_ENV !== "production") {
            options.debug = 3
        }

        const peer = new PeerJS(code, options)
        setPeer(peer)

        console.log("Connection to peer server established")
    }

    return {
        file,
        peer,
        onSelectFile,
    }
}
