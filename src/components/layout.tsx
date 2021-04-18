import React from "react"
import NextLink from "next/link"
import { Box, Container, Flex, Heading, HStack, Link, Text, VStack } from "@chakra-ui/react"

export const Layout: React.FC = (props) => {
    return (
        <Container py={30} maxW="container.lg">
            <Flex justify="space-between" align="center">
                <NextLink href="/">
                    <a>
                        <Heading fontSize="2xl" md={0}>
                            WebDrop
                        </Heading>
                        <Text ml={1} fontSize="sm">
                            P2P data transfer
                        </Text>
                    </a>
                </NextLink>

                <HStack spacing={5}>
                    <Link isExternal href="https://github.com/marvinkome/webdrop">
                        Github
                    </Link>
                    <Link isExternal href="https://github.com/marvinkome">
                        👋 I made this
                    </Link>
                </HStack>
            </Flex>

            <Flex
                direction="column"
                alignItems="center"
                bg={{ md: "blue.800" }}
                rounded="2xl"
                mt={14}
                py={16}
            >
                <VStack textAlign="center" spacing={2}>
                    <Box maxW="30rem">
                        <Heading fontWeight={{ base: "600", md: "500" }}>
                            File transfer to any device on the internet
                        </Heading>
                    </Box>

                    <Text fontSize="small">
                        Share files with any device on the internet securely.
                    </Text>
                </VStack>

                {props.children}
            </Flex>
        </Container>
    )
}
