import { useState, useEffect } from "react";

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // Check if already running as PWA
        const standalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            navigator.standalone === true;
        setIsStandalone(standalone);

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);
            console.log("beforeinstallprompt fired");
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setShowInstallButton(false);
            console.log("PWA installed successfully");
        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    // Periodic animation trigger
    useEffect(() => {
        const triggerAnimation = () => {
            setIsAnimating(true);
            // Stop animating after the animation completes (600ms)
            setTimeout(() => setIsAnimating(false), 600);
        };

        // Initial animation after 2 seconds
        const initialTimeout = setTimeout(triggerAnimation, 2000);

        // Then repeat every 5 seconds
        const interval = setInterval(triggerAnimation, 5000);

        return () => {
            clearTimeout(initialTimeout);
            clearInterval(interval);
        };
    }, []);

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

    // Don't render anything if already in standalone mode (PWA)
    if (isStandalone) return null;

    // Don't render if no install prompt available
    if (!showInstallButton) return null;

    return (
        <button
            onClick={handleInstallClick}
            className="text-md flex items-center justify-between gap-2 rounded-full border-2 border-rose-700 bg-neutral-900 px-4 py-2.5 font-semibold text-white shadow-lg lg:px-5 lg:py-3 lg:text-lg 2xl:gap-4 2xl:px-7 2xl:py-4 2xl:text-xl"
        >
            <img
                src="/web-app-manifest-512x512-maskable.png"
                alt="KinoSchurke"
                className={`size-6 transition-transform lg:size-8 2xl:size-9 ${isAnimating ? "animate-wiggle" : ""}`}
            />
            <p>App Laden</p>
            <i className="fas fa-download"></i>
        </button>
    );
};

export default InstallPWA;
