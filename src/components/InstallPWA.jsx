// src/components/InstallPWA.jsx
import { useState, useEffect } from "react";

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [debugState, setDebugState] = useState({});

    const resetInstallState = async () => {
        if ("serviceWorker" in navigator) {
            const registrations =
                await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }
        if ("caches" in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        }
        window.location.reload();
    };

    useEffect(() => {
        const updateDebugState = () => {
            setDebugState({
                isStandalone: window.matchMedia("(display-mode: standalone)")
                    .matches,
                isPWA:
                    navigator.standalone ||
                    window.matchMedia("(display-mode: standalone)").matches,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                promptAvailable: !!deferredPrompt,
                // Add these new checks
                serviceWorkerSupported: "serviceWorker" in navigator,
                serviceWorkerRegistered: false,
                manifestLoaded: !!document.querySelector(
                    'link[rel="manifest"]',
                ),
                isHttps: window.location.protocol === "https:",
            });

            // Check service worker registration
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker
                    .getRegistrations()
                    .then((registrations) => {
                        setDebugState((prev) => ({
                            ...prev,
                            serviceWorkerRegistered: registrations.length > 0,
                        }));
                    });
            }
        };

        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
            updateDebugState();
        });

        window.addEventListener("appinstalled", () => {
            setDeferredPrompt(null);
            setShowInstallButton(false);
            updateDebugState();
            console.log("PWA installed successfully");
        });

        updateDebugState();
    }, [deferredPrompt]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User ${outcome} the installation`);

            if (outcome === "accepted") {
                setShowInstallButton(false);
            }

            setDeferredPrompt(null);
        } catch (error) {
            console.error("Installation failed:", error);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {/* {process.env.NODE_ENV === "development" && (
                <div className="rounded-lg bg-zinc-800 p-4 shadow-lg">
                    <h3 className="mb-2 font-semibold text-white">
                        PWA Debug Panel
                    </h3>
                    <pre className="max-h-40 overflow-auto text-xs text-gray-300">
                        {JSON.stringify(debugState, null, 2)}
                    </pre>
                    <button
                        onClick={resetInstallState}
                        className="mt-2 rounded bg-red-600 px-3 py-1 text-sm text-white transition-colors hover:bg-red-700"
                    >
                        Reset Installation
                    </button>
                </div>
            )} */}

            {showInstallButton && (
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-white shadow-lg transition-colors hover:bg-rose-700"
                >
                    <i className="fas fa-download"></i>
                    Install App
                </button>
            )}
        </div>
    );
};

export default InstallPWA;
