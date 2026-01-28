/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif"],
                poppins: ["Poppins", "sans-serif"],
                notoSans: ["Noto Sans", "sans-serif"],
                jaro: ["Jaro", "sans-serif"],
                bungee: ["Bungee", "sans-serif"],
                dmSans: ["DM Sans", "sans-serif"],
                figtree: ["Figtree", "sans-serif"],
                lexend: ["Lexend", "sans-serif"],
                outfit: ["Outfit", "sans-serif"],
            },
            screens: {
                tall: {
                    raw: "only screen and (max-height: 960px) and (max-width: 480px)",
                },
                wide: {
                    raw: "only screen and (max-height: 480px) and (max-width: 960px)",
                },
                portrait: {
                    raw: "(orientation: portrait)",
                },
                landscape: {
                    raw: "(orientation: landscape)",
                },
                tallOrWideAndPortrait: {
                    raw: "only screen and ((max-height: 960px) and (max-width: 480px) or (max-height: 480px) and (max-width: 960px)) and (orientation: portrait)",
                },
                tallOrWideAndLandscape: {
                    raw: "only screen and ((max-height: 960px) and (max-width: 480px) or (max-height: 480px) and (max-width: 960px)) and (orientation: landscape)",
                },
            },
        },
    },
    // uncomment if you have the plugin installed:
    // plugins: [require("@tailwindcss/line-clamp")],
};
