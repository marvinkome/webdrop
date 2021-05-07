import { customAlphabet } from "nanoid"

const alphabet = "123456789ABCDEFGHIJKLMNPQRSTUVWXYZ"
const nanoid = customAlphabet(alphabet, 6)

export function dowloadUrl(url: string, name: string) {
    const a = document.createElement("a")

    a.href = url
    a.download = name

    a.click()
}

export function chunkFile(file: File, onSplit: (e: ProgressEvent<FileReader>) => void) {
    const chunkSize = 16384

    let offset = 0
    let fileReader = new FileReader()

    const readSlice = (o: number) => {
        console.log("[chunkFile] readSlice: ", o)
        const slice = file.slice(offset, o + chunkSize)
        fileReader.readAsArrayBuffer(slice)
    }

    fileReader.addEventListener("error", (error) => console.error("Error reading file:", error))
    fileReader.addEventListener("abort", (event) => console.log("File reading aborted:", event))
    fileReader.addEventListener("load", (e) => {
        console.log("[read-file] FileRead.onload", e)
        onSplit(e)

        offset += (e.target?.result as ArrayBuffer).byteLength
        if (offset < file.size) {
            readSlice(offset)
        }
    })

    return readSlice
}

export async function setupPeerJS() {
    const { default: PeerJS } = await import("peerjs")
    const code = nanoid()

    const options: any = {}
    if (process.env.NODE_ENV !== "production") {
        options.debug = 2
    }

    return new PeerJS(code, options)
}
