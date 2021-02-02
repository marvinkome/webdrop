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

export function fileSize(b?: number) {
    if (!b) return false
    let bytes = b * 1000

    var exp = (Math.log(bytes) / Math.log(1024)) | 0
    var result = (bytes / Math.pow(1024, exp)).toFixed(2)
    return result + (exp == 0 ? "bytes" : "KMGTPEZY"[exp - 1])
}
