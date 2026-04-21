import React from "react"
import {
  Box,
  Button,
  Heading,
  HStack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Text,
  useClipboard,
} from "@chakra-ui/react"

import { IoCopyOutline, IoCloudDownloadOutline } from "react-icons/io5"
import { Layout } from "components/layout"
import { TransferDetails } from "components/transfer-details"
import { useConnectionSetup, useReceiveFile } from "hooks/receive"

export default function Receive() {
  const connSetup = useConnectionSetup()
  const { fileInfo, receivedText, ...transferState } = useReceiveFile(connSetup.dataConn)

  return (
    <Layout>
      {receivedText ? (
        <ReceivedText text={receivedText} />
      ) : transferState.transferStarted && fileInfo ? (
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
            Enter access code to receive
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
                Connect
              </Button>
            </HStack>
          </form>
        </Box>
      )}
    </Layout>
  )
}

function ReceivedText({ text }: { text: string }) {
  const { hasCopied, onCopy } = useClipboard(text)
  return (
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
      <Heading mb={2} fontWeight="500" fontSize="lg">
        Text received!
      </Heading>
      <Text fontSize="sm" mb={4}>
        The text below has been transferred to you.
      </Text>

      <Box
        bg="gray.600"
        rounded="md"
        p={4}
        mb={6}
        fontSize="sm"
        maxH="300px"
        overflowY="auto"
        sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {text}
      </Box>

      <HStack spacing={4}>
        <Button onClick={onCopy} leftIcon={<IoCopyOutline />} colorScheme="primary" variant="solid">
          {hasCopied ? "Copied!" : "Copy text"}
        </Button>
      </HStack>
    </Box>
  )
}
