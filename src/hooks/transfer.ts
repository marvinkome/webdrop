import Peer from "peerjs"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@chakra-ui/react"
import { fileSplitterCreator } from "utils/file"
import { setupPeerJS } from "utils"

export function useFileTransfer(peer?: Peer, file?: File) {
    const [transferStarted, setTransferStarted] = useState(false)
    const [transferCompleted, setTransferCompleted] = useState(false)
    const [transferedSize, setTransferredSize] = useState(0)

    const fileSplitter = useRef<ReturnType<typeof fileSplitterCreator>>()

    function transferFile(dataConn: Peer.DataConnection) {
        if (!file) return

        // send file details to peer
        const fileDetails = JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
        })

        dataConn.send(fileDetails)

        // send file
        fileSplitter.current = fileSplitterCreator(file)
        fileSplitter.current?.start()

        // add listeners
        fileSplitter.current?.addEventListener("split-file", (e: any) => {
            setTransferStarted(true)
            dataConn.send(e.detail.chunk)
        })

        fileSplitter.current?.addEventListener("update-offset", (e: any) => {
            const offset = e.detail.offset

            setTransferredSize(Math.floor((offset / file.size) * 100))
            if (offset >= file.size) {
                setTransferStarted(false)
                setTransferCompleted(true)
            }
        })
    }

    useEffect(() => {
        if (!peer) return

        const onConnection = (dataConn: Peer.DataConnection) => {
            dataConn.on("open", () => transferFile(dataConn))
        }

        peer.on("connection", onConnection)
    }, [peer, file])

    return {
        transferStarted,
        transferCompleted,
        transferedSize,
    }
}

export function useTransferSetup() {
    const toast = useToast({ position: "top-right", isClosable: true })
    const [file, setFile] = useState<File>()
    const [peer, setPeer] = useState<Peer>()

    const onSelectFile = async (file: File) => {
        if (file.size === 0) {
            toast({ title: "File empty", description: "Please choose a valid file" })
            return
        }

        const peer = await setupPeerJS()

        setFile(file)
        setPeer(peer)
    }

    return {
        file,
        peer,
        onSelectFile,
    }
}
