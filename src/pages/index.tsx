import { Box, Container, Flex, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"
import { FilePicker } from "components/file-picker"
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
