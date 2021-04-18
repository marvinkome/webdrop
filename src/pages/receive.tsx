import React from "react"
import {
    Box,
    Heading,
    HStack,
    Text,
    Button,
    FormControl,
    FormHelperText,
    FormLabel,
    Input,
    FormErrorMessage,
} from "@chakra-ui/react"

import { IoCloudDownloadOutline } from "react-icons/io5"
import { Layout } from "components/layout"
import { TransferDetails } from "components/transfer-details"

export default function Receive() {
    return (
        <Layout>
            <TransferDetails />
            {/* <Box
                maxW="md"
                w={[350, 700]}
                mt={10}
                p={5}
                boxShadow="dark-lg"
                rounded="lg"
                bg="gray.700"
                align="left"
            >
                <Heading mb={5} align="left" fontWeight="500" fontSize="lg" isTruncated>
                    Enter access code to receive file
                </Heading>

                <Box mb={7} as="form">
                    <FormControl id="code" isInvalid>
                        <FormLabel fontWeight="normal">Access Code</FormLabel>
                        <Input type="text" />
                        <FormErrorMessage>Invalid access code</FormErrorMessage>
                    </FormControl>
                </Box>

                <HStack spacing={4}>
                    <Button
                        leftIcon={<IoCloudDownloadOutline />}
                        colorScheme="primary"
                        variant="solid"
                    >
                        Receive File
                    </Button>
                </HStack>
            </Box> */}
        </Layout>
    )
}
