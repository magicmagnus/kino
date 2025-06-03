import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { HelmetProvider } from "react-helmet-async";

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js").then(
            (registration) => {
                console.log(
                    "ServiceWorker registration successful with scope: ",
                    registration.scope,
                );
            },
            (err) => {
                console.log("ServiceWorker registration failed: ", err);
            },
        );
    });
}

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </StrictMode>,
);
