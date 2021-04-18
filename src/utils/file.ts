import { dowloadUrl } from "utils"

// I'm doing this because EventTarget doens't exist on server side
export function fileSplitterCreator(file: File) {
    if (typeof window === "undefined") return

    class FileSplitter extends EventTarget {
        CHUNK_SIZE = 16384

        offset: number = 0
        fileReader = new FileReader()
        file: File

        paused: boolean = false

        constructor(file: File) {
            super()

            this.file = file

            // add event listener for fileReader
            this.fileReader.addEventListener("load", (e) => {
                console.log("[read-file] FileRead.onload", e)
                this.dispatchEvent(
                    new CustomEvent("split-file", {
                        detail: { chunk: e.target?.result },
                    })
                )

                this.offset += (e.target?.result as ArrayBuffer).byteLength
                this.dispatchEvent(
                    new CustomEvent("update-offset", {
                        detail: { offset: this.offset },
                    })
                )

                if (!this.paused && this.offset < this.file.size) {
                    this.readSlice(this.offset)
                }
            })
        }

        readSlice(offset: number) {
            console.log("[FileSplitter] readSlice: ", offset)

            const slice = this.file.slice(this.offset, offset + this.CHUNK_SIZE)
            this.fileReader.readAsArrayBuffer(slice)
        }

        start() {
            this.readSlice(0)
            this.dispatchEvent(new Event("start"))
        }

        pause() {
            this.paused = true
            this.dispatchEvent(new Event("pause"))
        }

        resume() {
            this.paused = false
            this.dispatchEvent(new Event("resume"))

            // resume reading from file
            this.readSlice(this.offset)
        }
    }

    return new FileSplitter(file)
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
