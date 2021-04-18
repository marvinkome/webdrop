import React from "react"
import { FilePicker } from "components/file-picker"
import { Layout } from "components/layout"
import { useTransferSetup, useFileTransfer } from "hooks/transfer"
import { FileInfo } from "components/file-info"
import { TransferDetails } from "components/transfer-details"

export default function HomePage() {
    const { file, peer, onSelectFile } = useTransferSetup()
    const transferState = useFileTransfer(peer, file)

    let body = <FilePicker onSelectFile={onSelectFile} />

    if (file && peer) {
        body = <FileInfo file={file} code={peer.id} />
    }

    if (transferState.transferStarted && file) {
        body = (
            <TransferDetails
                fileInfo={{ name: file.name, size: file.size }}
                transferData={{
                    started: transferState.transferStarted,
                    completed: transferState.transferCompleted,
                    transferredSize: transferState.transferedSize,
                    bitrate: transferState.bitrate,
                }}
            />
        )
    }

    return <Layout>{body}</Layout>
}
