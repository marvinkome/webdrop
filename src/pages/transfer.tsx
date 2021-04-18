import React from "react"
import { Box, Heading, HStack, Text, Button } from "@chakra-ui/react"
import { FilePicker } from "components/file-picker"
import { IoCopyOutline } from "react-icons/io5"
import { Layout } from "components/layout"

function FileInfo() {
    return (
        <Box maxW="md" mt={10} p={5} boxShadow="dark-lg" rounded="lg" bg="gray.700">
            <Heading mb={2} align="left" fontWeight="500" fontSize="lg" isTruncated>
                google_services.json (40mb)
            </Heading>

            <Text align="left" fontSize="sm">
                Your file is ready to be transferred. To begin transfer, the receiving user have to
                put in this access code.
            </Text>

            <Box my={6} align="left">
                <Text fontWeight="600">Access Code</Text>
                <Text letterSpacing={5}>345689</Text>
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
    const [file, setFile] = React.useState<File | null>(null)

    return (
        <Layout>
            {file ? <FileInfo /> : <FilePicker onSelectFile={(file) => setFile(file)} />}
        </Layout>
    )
}
