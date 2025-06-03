import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true, // Allows the server to be accessed over the network
        port: 3000, // Optional: Specify a custom port (default is 5173)
    },
    build: {
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "index.html"),
                404: path.resolve(__dirname, "public/404.html"),
            },
        },
    },
});
