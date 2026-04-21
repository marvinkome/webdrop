import React, { useState } from "react"
import {
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
    const { text, peer: textPeer, onShareText } = useTextSetup()
    const { textSent } = useTextTransfer(textPeer, text)
    const [inputText, setInputText] = useState("")

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

    let textBody = (
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
            <Button
                colorScheme="primary"
                onClick={() => onShareText(inputText)}
                isDisabled={!inputText.trim()}
            >
                Share Text
            </Button>
        </Box>
    )

    if (textPeer && text) {
        textBody = <TextInfo text={text} code={textPeer.id} sent={textSent} />
    }

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

function TextInfo({ text, code, sent }: { text: string; code: string; sent: boolean }) {
    const { hasCopied, onCopy } = useClipboard(code)
    return (
        <Box maxW="md" w={[350, 600]} mt={6} p={5} boxShadow="dark-lg" rounded="lg" bg="gray.700" align="left">
            <Heading align="left" fontWeight="500" fontSize="lg" mb={1}>
                {sent ? "Text sent!" : "Text ready to share"}
            </Heading>
            <Text fontSize="sm" mb={4}>
                Share this access code with the receiver to transfer your text.
            </Text>

            <Box bg="gray.600" rounded="md" p={3} mb={5} maxH="120px" overflowY="auto" fontSize="sm">
                {text}
            </Box>

            <Box mb={6}>
                <Text fontWeight="600">Access Code</Text>
                <Text letterSpacing={2}>{code}</Text>
            </Box>

            <HStack spacing={4}>
                <Button onClick={onCopy} leftIcon={<IoCopyOutline />} colorScheme="primary" variant="solid">
                    {hasCopied ? "Copied" : "Copy code"}
                </Button>
            </HStack>
        </Box>
    )
}
