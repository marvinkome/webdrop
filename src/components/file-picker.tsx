import React from "react"
import { useMediaQuery, Box, Button, Text } from "@chakra-ui/react"

function useDragAndDrop(elementRef: React.MutableRefObject<HTMLDivElement | null>) {
    const [files, setFiles] = React.useState<FileList>()
    const [dragging, setDragging] = React.useState(false)
    const dragCounter = React.useRef(0)

    const handleDrag = React.useCallback((e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handleDragIn = React.useCallback((e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // use drag counter to keep track of how many children drag is being called on
        dragCounter.current++
        if (e.dataTransfer?.items && e.dataTransfer.items.length) {
            setDragging(true)
        }
    }, [])

    const handleDragOut = React.useCallback((e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // only stop dragging when item is all the way out of the parent container
        dragCounter.current--
        if (dragCounter.current > 0) return

        setDragging(false)
    }, [])

    const handleDrop = React.useCallback((e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setDragging(false)
        if (e.dataTransfer?.files && e.dataTransfer.files.length) {
            setFiles(e.dataTransfer.files)
            e.dataTransfer.clearData()
            dragCounter.current = 0
        }
    }, [])

    React.useEffect(() => {
        elementRef.current?.addEventListener("dragenter", handleDragIn)
        elementRef.current?.addEventListener("dragleave", handleDragOut)
        elementRef.current?.addEventListener("dragover", handleDrag)
        elementRef.current?.addEventListener("drop", handleDrop)

        return () => {
            elementRef.current?.removeEventListener("dragenter", handleDragIn)
            elementRef.current?.removeEventListener("dragleave", handleDragOut)
            elementRef.current?.removeEventListener("dragover", handleDrag)
            elementRef.current?.removeEventListener("drop", handleDrop)
        }
    })

    return {
        dragging,
        files,
    }
}

export const FilePicker: React.FC<{ onSelectFile: (file: File) => void }> = (props) => {
    const [isSmallScreen] = useMediaQuery("(max-width: 425px)")
    const fileInputRef = React.useRef<HTMLInputElement | null>(null)
    const dropRef = React.useRef<HTMLDivElement | null>(null)
    const { dragging, files } = useDragAndDrop(dropRef)

    React.useEffect(() => {
        if (files?.length) {
            const file = files[0]
            props.onSelectFile(file)
        }
    }, [files])

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation()
        e.preventDefault()

        const files = e.target.files || []
        const file = files[0]

        props.onSelectFile(file)
    }

    return (
        <>
            <input
                type="file"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={onFileChange}
            />

            {isSmallScreen ? (
                <Box p={5}>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        fontWeight="normal"
                        mt={5}
                        colorScheme="primary"
                        size="lg"
                    >
                        Browse Files
                    </Button>
                </Box>
            ) : (
                <Box
                    ref={dropRef}
                    mt={10}
                    p={5}
                    w={[350, 600]}
                    textAlign="center"
                    boxShadow="dark-lg"
                    rounded="2xl"
                    bg={dragging ? "gray.500" : "gray.700"}
                >
                    <Box
                        rounded="lg"
                        borderWidth={2}
                        borderColor="primary.100"
                        borderStyle="dashed"
                        py={{ base: 5, md: 16 }}
                        px={{ base: 20, md: 32 }}
                    >
                        <Text>Drag & Drop files here to send</Text>
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            fontWeight="normal"
                            mt={5}
                            variant="outline"
                        >
                            Browse Files
                        </Button>
                    </Box>
                </Box>
            )}
        </>
    )
}
