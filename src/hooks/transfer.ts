import Peer from "peerjs"
import { useState, useEffect } from "react"
import { useToast } from "@chakra-ui/react"

export function useTransfer() {
    const toast = useToast()
    const [file, setFile] = useState<File | null>(null)
    const [peer, setPeer] = useState<Peer | null>(null)

    // on mount set peer
    useEffect(() => {
        import("peerjs").then(({ default: PeerJS }) => {
            const peer = new PeerJS({
                ...(process.env.NODE_ENV !== "production"
                    ? {
                          debug: 3,
                      }
                    : {
                          host: "/",
                          path: "/api/peer",
                      }),
            })

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
