import React from "react"
import { FilePicker } from "components/file-picker"
import { Layout } from "components/layout"
import { useTransfer } from "hooks/transfer"
import { FileInfo } from "components/file-info"

export default function HomePage() {
    const transferData = useTransfer()

    return (
        <Layout>
            {transferData.file && transferData.peerId ? (
                <FileInfo file={transferData.file} code={transferData.peerId} />
            ) : (
                <FilePicker onSelectFile={transferData.onSelectFile} />
            )}
        </Layout>
    )
}
