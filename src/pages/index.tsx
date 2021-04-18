import React from "react"
import { FilePicker } from "components/file-picker"
import { Layout } from "components/layout"
import { useTransferSetup, useFileTransfer } from "hooks/transfer"
import { FileInfo } from "components/file-info"
import { TransferDetails } from "components/transfer-details"

export default function HomePage() {
    const setupData = useTransferSetup()
    const transferState = useFileTransfer(setupData.peer, setupData.file)

    let body = <FilePicker onSelectFile={setupData.onSelectFile} />

    if (setupData.file && setupData.peer) {
        body = <FileInfo file={setupData.file} code={setupData.peer.id} />
    }

    if (transferState.transferStarted && setupData.file) {
        body = (
            <TransferDetails
                fileInfo={{ name: setupData.file.name, size: setupData.file.size }}
                transferData={{
                    started: transferState.transferStarted,
                    completed: transferState.transferCompleted,
                    transferredSize: transferState.transferedSize,
                }}
            />
        )
    }

    return <Layout>{body}</Layout>
}
