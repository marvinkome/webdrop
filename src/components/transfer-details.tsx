import React from "react"
import prettyBytes from "pretty-bytes"
import {
    Box,
    Flex,
    Text,
    IconButton,
    CircularProgress,
    CircularProgressLabel,
} from "@chakra-ui/react"
import { IoPauseOutline, IoCloseOutline } from "react-icons/io5"

type Props = {
    fileInfo: {
        name: string
        size: number
    }
    transferData: {
        started: boolean
        completed: boolean
        transferredSize: number
    }
}
export const TransferDetails: React.FC<Props> = (props) => {
    return (
        <Box w={[350, 700]} maxW="md" mt={10} p={5} boxShadow="dark-lg" rounded="lg" bg="gray.700">
            <Box mb={5}>
                <Text fontSize="small" textAlign="center" isTruncated>
                    {props.fileInfo.name}
                </Text>

                <Text fontSize="small" textAlign="center" isTruncated>
                    ({prettyBytes(props.fileInfo.size)})
                </Text>
            </Box>

            <Flex justify="space-around" align="center">
                {/* <IconButton rounded="full" aria-label="Pause" icon={<IoPauseOutline />} /> */}

                <CircularProgress
                    capIsRound
                    thickness="5px"
                    size="150px"
                    value={props.transferData.transferredSize}
                    color="blue.400"
                >
                    <CircularProgressLabel>
                        <Text color="blue.500" fontWeight="500" fontSize="4xl">
                            {props.transferData.transferredSize}%
                        </Text>
                        <Text fontWeight="500" fontSize="sm">
                            4.2 mb/s
                        </Text>
                    </CircularProgressLabel>
                </CircularProgress>

                {/* <IconButton rounded="full" aria-label="Cancel" icon={<IoCloseOutline />} /> */}
            </Flex>
        </Box>
    )
}
