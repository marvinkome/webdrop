import React from "react"
import { Box, Heading, HStack, Text, Button } from "@chakra-ui/react"
import { FilePicker } from "components/file-picker"
import { IoCopyOutline } from "react-icons/io5"
import { Layout } from "components/layout"
import prettyBytes from "pretty-bytes"
import { useTransfer } from "hooks/transfer"

const FileInfo: React.FC<{ file: File; code: string }> = (props) => {
    return (
        <Box maxW="md" w={[350, 700]} mt={10} p={5} boxShadow="dark-lg" rounded="lg" bg="gray.700">
            <Box align="left">
                <Heading align="left" fontWeight="500" fontSize="lg" isTruncated>
                    {props.file.name}
                </Heading>
                <Text mb={2} fontSize="sm">
                    {prettyBytes(props.file.size)}
                </Text>
            </Box>

            <Text align="left" fontSize="sm">
                Your file is ready to be transferred. To begin transfer, the receiving user have to
                put in this access code.
            </Text>

            <Box my={6} align="left">
                <Text fontWeight="600">Access Code</Text>
                <Text letterSpacing={5}>{props.code}</Text>
            </Box>

            <HStack spacing={4}>
                <Button leftIcon={<IoCopyOutline />} colorScheme="primary" variant="solid">
                    Copy code
                </Button>
            </HStack>
        </Box>
    )
}

export default function Transfer() {
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
