import Peer from "peerjs"
import React, { useState, useEffect, useRef } from "react"
import { setupPeerJS } from "utils"
import { FileBuilder } from "utils/file"
import { useBitrate } from "./bitrate"

export function useReceiveFile(dataConn?: Peer.DataConnection) {
    const [fileInfo, setFileInfo] = useState<{ name: string; size: number }>()

    const [transferStarted, setTransferStarted] = useState(false)
    const [transferCompleted, setTransferCompleted] = useState(false)
    const [transferedSize, setTransferredSize] = useState(0)

    const bitrateObj = useBitrate(false)
    const fileBuilder = useRef<FileBuilder>()

    function receiveFile(data: any) {
        if (typeof data === "string") {
            console.log("[receiveFile] Receive file details", data)
            const parsedData = JSON.parse(data)

            setFileInfo({ name: parsedData.name, size: parsedData.size })

            fileBuilder.current = new FileBuilder(parsedData)
            fileBuilder.current.onAddChunk = (newSize) => {
                setTransferredSize(newSize)
            }

            fileBuilder.current.onComplete = () => {
                setTransferStarted(false)
                setTransferCompleted(true)

                bitrateObj.cancel()
                dataConn?.close()
            }

            return
        }

        if (!transferStarted) setTransferStarted(true)
        fileBuilder.current?.addChunk(data)
    }

    useEffect(() => {
        dataConn?.on("open", async () => {
            bitrateObj.init(dataConn?.peerConnection!)
            dataConn?.on("data", receiveFile)
        })
    }, [dataConn])

    return {
        fileInfo,
        transferCompleted,
        transferStarted,
        transferedSize,
        bitrate: bitrateObj.bitrate,
    }
}

export function useConnectionSetup() {
    const [peer, setPeer] = useState<Peer>()
    const [connection, setConnection] = useState<Peer.DataConnection>()

    // connection state
    const [hasError, setHasError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [hasConnected, setHasConnected] = useState(false)

    // on mount set peer
    useEffect(() => {
        setupPeerJS().then((peer) => setPeer(peer))
    }, [])

    // listen for error
    useEffect(() => {
        if (!peer) return

        const errorListener = (err: any) => {
            if (err.type === "peer-unavailable") {
                setHasError(true)
                setLoading(false)
            }
        }

        peer.on("error", errorListener)

        return () => {
            peer.off("error", errorListener)
        }
    }, [peer])

    const connectWithSender = async (e: React.FormEvent) => {
        e.preventDefault()
        setHasError(false)

        // @ts-ignores
        const accessCode = e.target["code"].value

        // try to connect
        setLoading(true)
        const connection = peer?.connect(accessCode, {
            reliable: true,
        })

        connection?.on("open", () => {
            setHasError(false)
            setLoading(false)
            setHasConnected(true)
        })

        setConnection(connection)
    }

    return {
        state: {
            hasError,
            loading,
            hasConnected,
        },

        peer,
        dataConn: connection,
        connect: connectWithSender,
    }
}
