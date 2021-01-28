import sample from "lodash/sample"
import startCase from "lodash/startCase"

const AVATARS = [
    { name: "Bird", image: "1" },
    { name: "Kango", image: "2" },
    { name: "Dog", image: "3" },
    { name: "Parot", image: "4" },
    { name: "Cat", image: "5" },
    { name: "Giraffe", image: "6" },
    { name: "Deer", image: "7" },
    { name: "Bison", image: "8" },
]

const PREFIXES = [
    "adventurous",
    "affable",
    "ambitious",
    "amiable ",
    "amusing",
    "brave",
    "bright",
    "charming",
    "compassionate",
    "convivial",
    "courageous",
    "creative",
    "diligent",
    "easygoing",
    "emotional",
    "energetic",
    "enthusiastic",
    "exuberant",
    "fearless",
    "friendly",
    "funny",
    "generous",
    "gentle",
    "good",
    "helpful",
    "honest",
    "humorous",
    "imaginative",
    "independent",
    "intelligent",
    "intuitive",
    "inventive",
    "kind",
    "loving",
    "loyal",
    "modest",
    "neat",
    "nice",
    "optimistic",
    "passionate",
    "patient",
    "persistent",
    "polite",
    "practical",
    "rational",
    "reliable",
    "reserved",
    "resourceful",
    "romantic",
    "sensible",
    "sensitive",
    "sincere",
    "sympathetic",
    "thoughtful",
    "tough",
    "understanding",
    "versatile",
    "warmhearted",
]

export function getUserAvatar() {
    const avatar = sample(AVATARS)
    const prefix = sample(PREFIXES)

    return {
        url: `/avatar${avatar?.image}.jpeg`,
        label: startCase(`${prefix} ${avatar?.name}`),
    }
}

export function handleFileUpload(
    file: File,
    channel: RTCDataChannel,
    connection: RTCPeerConnection,
    onload: (offet: number) => void
) {
    console.log(`File is ${[file.name, file.size, file.type, file.lastModified].join(" ")}`)

    if (file.size === 0) {
        // toast message
        console.log("File is empty")
        channel.close()
        connection.close()
    }

    const chunkSize = 16384
    let offset = 0
    let fileReader = new FileReader()

    const readSlice = (o: number) => {
        console.log("readSlice: ", o)
        const slice = file.slice(offset, o + chunkSize)
        fileReader.readAsArrayBuffer(slice)
    }

    fileReader.addEventListener("error", (error) => console.error("Error reading file:", error))
    fileReader.addEventListener("abort", (event) => console.log("File reading aborted:", event))
    fileReader.addEventListener("load", (e) => {
        console.log("read complete", e.target?.result)
        channel.send(e.target?.result as string)
        offset += (e.target?.result as ArrayBuffer).byteLength
        onload(offset)

        if (offset < file.size) {
            readSlice(offset)
        }
    })

    readSlice(0)
    return fileReader
}

export function dowloadUrl(url: string, name: string) {
    const a = document.createElement("a")

    a.href = url
    a.download = name

    a.click()
}
