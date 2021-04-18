import React from "react"
import {
    Box,
    Flex,
    Text,
    IconButton,
    CircularProgress,
    CircularProgressLabel,
} from "@chakra-ui/react"
import { IoPauseOutline, IoCloseOutline } from "react-icons/io5"

export function TransferDetails() {
    return (
        <Box w={[350, 700]} maxW="md" mt={10} p={5} boxShadow="dark-lg" rounded="lg" bg="gray.700">
            <Flex mb={10} justify="space-around" align="center">
                <IconButton rounded="full" aria-label="Pause" icon={<IoPauseOutline />} />

                <CircularProgress
                    capIsRound
                    thickness="5px"
                    size="150px"
                    value={28}
                    color="blue.400"
                >
                    <CircularProgressLabel>
                        <Text color="blue.500" fontWeight="500" fontSize="4xl">
                            28%
                        </Text>
                        <Text fontWeight="500" fontSize="sm">
                            4.2 mb/s
                        </Text>
                    </CircularProgressLabel>
                </CircularProgress>

                <IconButton rounded="full" aria-label="Cancel" icon={<IoCloseOutline />} />
            </Flex>

            <Text isTruncated>google_services.json (50mb)</Text>
        </Box>
    )
}
