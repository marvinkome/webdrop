import React, { useState } from "react"
import {
    Badge,
    Box,
    Button,
    Heading,
    HStack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    Textarea,
    useClipboard,
} from "@chakra-ui/react"
import { IoCopyOutline } from "react-icons/io5"
import { FilePicker } from "components/file-picker"
import { Layout } from "components/layout"
import { useTransferSetup, useFileTransfer, useTextSetup, useTextTransfer } from "hooks/transfer"
import { FileInfo } from "components/file-info"
import { TransferDetails } from "components/transfer-details"

export default function HomePage() {
    const { file, peer, onSelectFile } = useTransferSetup()
    const transferState = useFileTransfer(peer, file)
    const { peer: textPeer, initSharing } = useTextSetup()
    const [inputText, setInputText] = useState("")
    const { isConnected } = useTextTransfer(textPeer, inputText)

    let fileBody = <FilePicker onSelectFile={onSelectFile} />

    if (file && peer) {
        fileBody = <FileInfo file={file} code={peer.id} />
    }

    if (transferState.transferStarted && file) {
        fileBody = (
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

    const textBody = (
        <Box mt={10} w={[350, 600]} p={5} boxShadow="dark-lg" rounded="2xl" bg="gray.700">
            <Textarea
                placeholder="Paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                mb={4}
                resize="vertical"
                bg="gray.600"
                border="none"
                _focus={{ boxShadow: "none", bg: "gray.500" }}
            />
            {textPeer ? (
                <TextShareInfo code={textPeer.id} isConnected={isConnected} />
            ) : (
                <Button
                    colorScheme="primary"
                    onClick={initSharing}
                    isDisabled={!inputText.trim()}
                >
                    Share Text
                </Button>
            )}
        </Box>
    )

    return (
        <Layout>
            <Tabs colorScheme="primary" mt={8} w={[350, 600]} align="center">
                <TabList>
                    <Tab>Files</Tab>
                    <Tab>Text</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel p={0} pt={2}>{fileBody}</TabPanel>
                    <TabPanel p={0} pt={2}>{textBody}</TabPanel>
                </TabPanels>
            </Tabs>
        </Layout>
    )
}

function TextShareInfo({ code, isConnected }: { code: string; isConnected: boolean }) {
    const { hasCopied, onCopy } = useClipboard(code)
    return (
        <Box mt={2}>
            <HStack mb={4} spacing={3} align="center">
                <Badge colorScheme={isConnected ? "green" : "yellow"} fontSize="xs" px={2} py={1} rounded="full">
                    {isConnected ? "Connected — editing live" : "Waiting for receiver..."}
                </Badge>
            </HStack>

            <Box mb={4}>
                <Text fontWeight="600" fontSize="sm">Access Code</Text>
                <Text letterSpacing={2} fontSize="sm">{code}</Text>
            </Box>

            <Button onClick={onCopy} leftIcon={<IoCopyOutline />} colorScheme="primary" variant="solid" size="sm">
                {hasCopied ? "Copied" : "Copy code"}
            </Button>
        </Box>
    )
}
