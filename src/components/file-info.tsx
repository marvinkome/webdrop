import React from "react"
import prettyBytes from "pretty-bytes"
import { Box, Button, Heading, HStack, Text, useClipboard } from "@chakra-ui/react"
import { IoCopyOutline } from "react-icons/io5"

export const FileInfo: React.FC<{ file: File; code: string }> = (props) => {
    const { hasCopied, onCopy } = useClipboard(props.code)
    return (
        <Box maxW="md" w={[350, 600]} mt={10} p={5} boxShadow="dark-lg" rounded="lg" bg="gray.700">
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
                <Text letterSpacing={2}>{props.code}</Text>
            </Box>

            <HStack spacing={4}>
                <Button
                    onClick={onCopy}
                    leftIcon={<IoCopyOutline />}
                    colorScheme="primary"
                    variant="solid"
                >
                    {hasCopied ? "Copied" : "Copy code"}
                </Button>
            </HStack>
        </Box>
    )
}
