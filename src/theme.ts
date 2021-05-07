import { extendTheme } from "@chakra-ui/react"

export const theme = extendTheme({
    config: {
        initialColorMode: "dark",
        useSystemColorMode: false,
    },

    fonts: {
        body: "Rubik, sans-serif",
        heading: "Rubik, sans-serif",
    },

    colors: {
        primary: {
            "50": "#EDEDF8",
            "100": "#CCCCEB",
            "200": "#ABACDD",
            "300": "#8B8CD0",
            "400": "#6A6BC3",
            "500": "#494BB6",
            "600": "#3A3C92",
            "700": "#2C2D6D",
            "800": "#1D1E49",
            "900": "#0F0F24",
        },

        secondary: {
            "50": "#EEF5F6",
            "100": "#D0E3E7",
            "200": "#B1D0D8",
            "300": "#93BEC8",
            "400": "#74ACB9",
            "500": "#569AA9",
            "600": "#457B87",
            "700": "#345C65",
            "800": "#223D44",
            "900": "#111F22",
        },
    },

    styles: {
        global: {
            body: {
                // bg: "primary.800",
                color: "whiteAlpha.800",
            },
        },
    },

    components: {
        Button: {
            baseStyle: {
                fontWeight: "500",
            },
        },
    },
})
