import { dowloadUrl } from "utils"

// I'm doing this because EventTarget doens't exist on server side
export function fileSplitterCreator(file: File, chunkSize?: number) {
    if (typeof window === "undefined") return

    class FileSplitter extends EventTarget {
        CHUNK_SIZE = 16384

        offset: number = 0
        fileReader = new FileReader()
        file: File

        paused: boolean = false

        constructor(file: File, chunkSize?: number) {
            super()

            this.file = file
            if (chunkSize && chunkSize !== 0) {
                this.CHUNK_SIZE = chunkSize
            }

            // add event listener for fileReader
            this.fileReader.addEventListener("load", (e) => {
                // console.log("[read-file] FileRead.onload", e)
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
            // console.log("[FileSplitter] readSlice: ", offset)
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

    return new FileSplitter(file, chunkSize)
}

export function fileBuilderCreator(details: { name: string; size: number; type: string }) {
    if (typeof window === "undefined") return

    class FileBuilder extends EventTarget {
        fileDetails: { name: string; size: number; type: string }

        chunkSize: number = 0
        fs: any
        fileEntry: any

        constructor(details: { name: string; size: number; type: string }) {
            super()

            this.fileDetails = details
            this._requestFs().then(() => console.log("[FileBuilder]: File system setup - done."))
        }

        addChunk(chunk: ArrayBuffer) {
            const onError = (e: any) => console.log(this._errorHandler(e))

            const onSuccess = (fileEntry: any) => {
                this.fileEntry = fileEntry

                fileEntry.createWriter((writer: any) => {
                    const data = new Blob([chunk], { type: this.fileDetails.type })

                    writer.onwriteend = () => this._onWrite(data.size)
                    writer.onerror = function (error: any) {
                        this._errorHandler(error)
                        this.dispatchEvent(new Event("error"))
                    }

                    writer.seek(writer.length)
                    writer.write(data)
                }, onError)
            }

            this.fs.root.getFile(
                this.fileDetails.name,
                { create: !!!this.chunkSize },
                onSuccess,
                onError
            )
        }

        saveFile() {
            console.log("[FileBuilder] File ready for download")
            let fileUrl

            // @ts-ignore
            if (window.webkitRequestFileSystem) {
                fileUrl = this.fileEntry.toURL()
            } else {
                this.fileEntry.file((file: any) => {
                    fileUrl = URL.createObjectURL(file)
                })
            }

            dowloadUrl(fileUrl, this.fileDetails.name)
            this.dispatchEvent(new Event("complete"))
        }

        _onWrite = (dataLength: number) => {
            console.log("[FileBuilder.addChunk] write buffer", dataLength)

            this.chunkSize += dataLength

            this.dispatchEvent(
                new CustomEvent("add-chunk", {
                    detail: {
                        chunkSize: Math.floor((this.chunkSize / this.fileDetails.size) * 100),
                    },
                })
            )

            if (this.chunkSize >= this.fileDetails.size) {
                this.saveFile()
            }
        }

        _requestFs = () => {
            return new Promise((resolve: (fs: any) => void, reject) => {
                // @ts-ignore
                const requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem

                requestFileSystem(
                    // @ts-ignore
                    window.TEMPORARY,
                    this.fileDetails.size,
                    (fs: any) => {
                        this.fs = fs
                        resolve(fs)
                    },
                    (e: any) => {
                        this._errorHandler(e)
                        reject(e)
                    }
                )
            })
        }

        _errorHandler = (e: any) => {
            let msg = ""

            switch (e.code) {
                // @ts-ignore
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = "QUOTA_EXCEEDED_ERR"
                    break
                // @ts-ignore
                case FileError.NOT_FOUND_ERR:
                    msg = "NOT_FOUND_ERR"
                    break
                // @ts-ignore
                case FileError.SECURITY_ERR:
                    msg = "SECURITY_ERR"
                    break
                // @ts-ignore
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = "INVALID_MODIFICATION_ERR"
                    break
                // @ts-ignore
                case FileError.INVALID_STATE_ERR:
                    msg = "INVALID_STATE_ERR"
                    break
                default:
                    msg = "Unknown Error"
                    break
            }

            console.log("[FileSystem] Error: " + msg)
            return msg
        }
    }

    return new FileBuilder(details)
}
