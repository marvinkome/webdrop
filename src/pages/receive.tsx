import React from "react"
import {
    Box,
    Heading,
    HStack,
    Button,
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
} from "@chakra-ui/react"

import { IoCloudDownloadOutline } from "react-icons/io5"
import { Layout } from "components/layout"
import { TransferDetails } from "components/transfer-details"
import { useConnectionSetup, useReceiveFile } from "hooks/receive"

export default function Receive() {
    const connSetup = useConnectionSetup()
    const { fileInfo, ...transferState } = useReceiveFile(connSetup.dataConn)

    return (
        <Layout>
            {transferState.transferStarted && fileInfo ? (
                <TransferDetails
                    fileInfo={fileInfo}
                    transferData={{
                        started: transferState.transferStarted,
                        completed: transferState.transferCompleted,
                        transferredSize: transferState.transferedSize,
                        bitrate: transferState.bitrate,
                    }}
                />
            ) : (
                <Box
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

                    <form onSubmit={connSetup.connect}>
                        <Box mb={7}>
                            <FormControl id="code" isInvalid={connSetup.state.hasError}>
                                <FormLabel fontWeight="normal">Access Code</FormLabel>
                                <Input id="code" type="text" />
                                <FormErrorMessage>Invalid access code</FormErrorMessage>
                            </FormControl>
                        </Box>

                        <HStack spacing={4}>
                            <Button
                                leftIcon={<IoCloudDownloadOutline />}
                                isLoading={connSetup.state.loading}
                                colorScheme="primary"
                                variant="solid"
                                type="submit"
                            >
                                Receive File
                            </Button>
                        </HStack>
                    </form>
                </Box>
            )}
        </Layout>
    )
}
