import Peer from "peerjs"
import { customAlphabet } from "nanoid"
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@chakra-ui/react"

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const nanoid = customAlphabet(alphabet, 6)

export function useTransfer() {
    const toast = useToast()
    const [file, setFile] = useState<File | null>(null)
    const [peer, setPeer] = useState<Peer | null>(null)

    // on mount set peer
    useEffect(() => {
        import("peerjs").then(({ default: PeerJS }) => {
            const code = nanoid()
            const options: any = {}

            if (process.env.NODE_ENV !== "production") {
                options.debug = 3
            }

            const peer = new PeerJS(code, options)
            setPeer(peer)
            console.log("Connection to peer server established")
        })
    }, [])

    const onSelectFile = (file: File) => {
        setFile(file)

        if (!peer) {
            return toast({
                title: "Setting up connection failed",
                description: "Unable to setup connection with receiver",
                status: "error",
                position: "top-right",
                isClosable: true,
            })
        }
    }

    return {
        file,
        peerId: peer?.id,
        onSelectFile,
    }
}
