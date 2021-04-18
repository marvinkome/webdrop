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
