import { Button } from "@chakra-ui/button"
import {
    Box,
    Container,
    Flex,
    Heading,
    HStack,
    Link,
    Text,
    useMediaQuery,
    VStack,
} from "@chakra-ui/react"
import React from "react"

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

function FilePicker() {
    const [isSmallScreen] = useMediaQuery("(max-width: 425px)")

    return isSmallScreen ? (
        <Box p={5}>
            <Button fontWeight="normal" mt={5} colorScheme="primary" size="lg">
                Browse Files
            </Button>
        </Box>
    ) : (
        <Box mt={10} p={5} boxShadow="dark-lg" rounded="2xl" bg="gray.700">
            <Box
                rounded="lg"
                borderWidth={2}
                borderColor="primary.100"
                borderStyle="dashed"
                py={{ base: 5, md: 16 }}
                px={{ base: 20, md: 32 }}
            >
                <Text>Drag & Drop files here to send</Text>
                <Button fontWeight="normal" mt={5} variant="outline">
                    Browse Files
                </Button>
            </Box>
        </Box>
    )
}

export default function Index() {
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
                        <Heading fontWeight="500">File transfer to anyone on the internet</Heading>
                    </Box>

                    <Text fontSize="small">
                        Share files with any device on the internet securely.
                    </Text>
                </VStack>

                <FilePicker />
            </Flex>
        </Container>
    )
}
