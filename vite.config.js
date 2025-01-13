import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // base: '/kino2/',
    server: {
        host: true, // Allows the server to be accessed over the network
        port: 3000, // Optional: Specify a custom port (default is 5173)
    },
});
