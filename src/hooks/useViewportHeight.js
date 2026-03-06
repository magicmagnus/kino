import { useEffect, useState } from "react";

export const useViewportHeight = () => {
    const [debugInfo, setDebugInfo] = useState({});

    useEffect(() => {
        const updateHeight = () => {
            // Set CSS custom property for actual viewport height
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);

            // Detect iOS
            const isIOS =
                /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === "MacIntel" &&
                    navigator.maxTouchPoints > 1);

            // Detect if running as standalone PWA
            const isStandalone =
                window.matchMedia("(display-mode: standalone)").matches ||
                navigator.standalone === true;

            // Detect iOS PWA specifically
            const isIOSPWA = isIOS && isStandalone;

            // Set CSS custom properties for platform-specific adjustments
            document.documentElement.style.setProperty(
                "--safe-area-bottom",
                isIOSPWA ? "0px" : "env(safe-area-inset-bottom, 0px)",
            );

            // Add class to html element for CSS targeting
            if (isIOSPWA) {
                document.documentElement.classList.add("ios-pwa");
            } else {
                document.documentElement.classList.remove("ios-pwa");
            }

            // Debug info
            setDebugInfo({
                windowInnerHeight: window.innerHeight,
                windowOuterHeight: window.outerHeight,
                documentHeight: document.documentElement.clientHeight,
                screenHeight: window.screen.height,
                availHeight: window.screen.availHeight,
                visualViewportHeight: window.visualViewport?.height,
                isStandalone,
                isIOS,
                isIOSPWA,
                isPWA:
                    navigator.standalone ||
                    window.matchMedia("(display-mode: standalone)").matches,
            });
        };

        // Initial update
        updateHeight();

        // Update on resize
        window.addEventListener("resize", updateHeight);

        // Update on orientation change
        window.addEventListener("orientationchange", () => {
            // Delay to allow browser to settle
            setTimeout(updateHeight, 100);
        });

        // Update when visual viewport changes (important for mobile)
        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", updateHeight);
        }

        return () => {
            window.removeEventListener("resize", updateHeight);
            window.removeEventListener("orientationchange", updateHeight);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener(
                    "resize",
                    updateHeight,
                );
            }
        };
    }, []);

    return debugInfo;
};
