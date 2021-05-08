import { useState, useRef } from "react"

export function useBitrate(sending: boolean) {
    const [bitrate, setBitrate] = useState(0)

    const statsInterval = useRef<any>()
    const timestampStart = useRef(0)
    const timestampPrev = useRef(0)
    const bytesPrev = useRef(0)

    async function calculateBitrate(remoteConnection: RTCPeerConnection) {
        if (remoteConnection.iceConnectionState !== "connected") return

        const stats = await remoteConnection.getStats()
        let activeCandidatePair: any
        stats.forEach((report) => {
            if (report.type === "transport") {
                activeCandidatePair = stats.get(report.selectedCandidatePairId)
            }
        })

        if (!activeCandidatePair) return
        if (timestampPrev.current === activeCandidatePair.timestamp) return

        const bytesNow = sending ? activeCandidatePair.bytesSent : activeCandidatePair.bytesReceived
        const bitrate = Math.round(
            ((bytesNow - bytesPrev.current) * 8) /
                (activeCandidatePair.timestamp - timestampPrev.current)
        )

        timestampPrev.current = activeCandidatePair.timestamp
        bytesPrev.current = bytesNow

        setBitrate(bitrate)
        return bitrate
    }

    async function init(remoteConnection: RTCPeerConnection) {
        timestampStart.current = new Date().getTime()
        timestampStart.current = new Date().getTime()
        timestampPrev.current = timestampStart.current
        statsInterval.current = setInterval(() => calculateBitrate(remoteConnection), 500)

        await calculateBitrate(remoteConnection)
    }

    function cancel() {
        clearInterval(statsInterval.current)
        setBitrate(0)
    }

    return { bitrate, init, cancel }
}
