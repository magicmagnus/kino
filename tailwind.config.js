/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif"],
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
