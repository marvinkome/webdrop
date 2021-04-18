import { dowloadUrl } from "utils"

// TODO:: refactor to use events
export class FileSplitter {
    CHUNK_SIZE = 16384

    offset: number = 0
    fileReader = new FileReader()
    file: File

    constructor(
        file: File,
        events: { onFileSplit: (res: any) => void; onOffsetUpdated: (newOffset: number) => void }
    ) {
        this.file = file
        this.start(events)
    }

    readSlice = (offset: number) => {
        console.log("[FileSplitter] readSlice: ", offset)

        const slice = this.file.slice(this.offset, offset + this.CHUNK_SIZE)
        this.fileReader.readAsArrayBuffer(slice)
    }

    start = (events: {
        onFileSplit: (res: any) => void
        onOffsetUpdated: (newOffset: number) => void
    }) => {
        this.readSlice(0)

        this.fileReader.addEventListener("load", (e) => {
            console.log("[read-file] FileRead.onload", e)

            events.onFileSplit(e.target?.result)

            this.offset += (e.target?.result as ArrayBuffer).byteLength
            events.onOffsetUpdated(this.offset)

            if (this.offset < this.file.size) {
                this.readSlice(this.offset)
            }
        })
    }
}

export class FileBuilder {
    fileDetails: { fileName: string; fileSize: number }

    chunks: ArrayBuffer[] = []
    chunkSize: number = 0

    constructor(details: { fileName: string; fileSize: number }) {
        this.fileDetails = details
    }

    addChunk(chunk: ArrayBuffer, onAddChunk: (size: number) => void, onComplete: () => void) {
        console.log("[FileBuilder.addChunk] receive buffer", chunk.byteLength)

        this.chunkSize += chunk.byteLength
        this.chunks.push(chunk)
        onAddChunk(Math.floor((this.chunkSize / this.fileDetails.fileSize) * 100))

        if (this.chunkSize >= this.fileDetails.fileSize) {
            console.log("[FileBuilder] File ready for download")

            const fileBlob = new Blob(this.chunks)
            dowloadUrl(URL.createObjectURL(fileBlob), this.fileDetails.fileName)
            onComplete()
        }
    }
}
