import React from "react"
import {
    Box,
    Container,
    Flex,
    Heading,
    HStack,
    Link,
    Text,
    VStack,
    Button,
    IconButton,
    CircularProgress,
    CircularProgressLabel,
} from "@chakra-ui/react"
import { FilePicker } from "components/file-picker"
import { IoCopyOutline, IoPauseOutline, IoCloseOutline } from "react-icons/io5"

function Header() {
    return (
        <Flex justify="space-between" align="center">
            <Box>
                <Heading fontSize="2xl" md={0}>
                    WebDrop
                </Heading>
                <Text ml={1} fontSize="sm">
                    P2P data transfer
                </Text>
            </Box>

            <HStack spacing={5}>
                <Link isExternal href="https://github.com/marvinkome/webdrop">
                    Github
                </Link>
                <Link isExternal href="https://github.com/marvinkome">
                    👋 I made this
                </Link>
            </HStack>
        </Flex>
    )
}

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

function TransferDetails() {
    return (
        <Box
            w={{ base: 80, md: 96 }}
            maxW="md"
            mt={10}
            p={5}
            boxShadow="dark-lg"
            rounded="lg"
            bg="gray.700"
        >
            <Flex mb={10} justify="space-evenly" align="center">
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

            <Text isTruncated>google_services.json</Text>
        </Box>
    )
}

export default function Index() {
    const [file, setFile] = React.useState<File | null>(null)

    return (
        <Container pt={30} maxW="container.lg">
            <Header />

            <Flex
                direction="column"
                align="center"
                bg={{ md: "blue.800" }}
                textAlign="center"
                rounded="2xl"
                mt={14}
                py={16}
            >
                <VStack spacing={2}>
                    <Box maxW="30rem">
                        <Heading fontWeight={{ base: "600", md: "500" }}>
                            File transfer to any device on the internet
                        </Heading>
                    </Box>

                    <Text fontSize="small">
                        Share files with any device on the internet securely.
                    </Text>
                </VStack>

                {/* <FileInfo /> */}
                <FilePicker onSelectFile={(file) => setFile(file)} />
                {/* <TransferDetails /> */}
            </Flex>
        </Container>
    )
}
