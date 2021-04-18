import React from "react"
import NextLink from "next/link"
import { HStack, Button } from "@chakra-ui/react"
import { Layout } from "components/layout"

export default function Index() {
    return (
        <Layout>
            <HStack mt={10} spacing={10}>
                <NextLink href="/transfer">
                    <a>
                        <Button colorScheme="primary" size="lg">
                            Transfer
                        </Button>
                    </a>
                </NextLink>

                <NextLink href="/receive">
                    <a>
                        <Button colorScheme="secondary" size="lg">
                            Receive
                        </Button>
                    </a>
                </NextLink>
            </HStack>
        </Layout>
    )
}
