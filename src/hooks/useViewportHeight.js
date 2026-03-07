import { useEffect, useState } from "react";

export const useViewportHeight = () => {
    const [debugInfo, setDebugInfo] = useState({});

    useEffect(() => {
        // Detect iOS
        const isIOS =
            /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

        // Detect if running as standalone PWA
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            navigator.standalone === true;

        // Detect iOS PWA specifically
        const isIOSPWA = isIOS && isStandalone;

        // Add class for CSS targeting
        if (isIOSPWA) {
            document.documentElement.classList.add("ios-pwa");
        } else {
            document.documentElement.classList.remove("ios-pwa");
        }

        const updateHeight = () => {
            const visualViewport = window.visualViewport;

            let fullHeight;
            let safeAreaBottom = 20;

            if (isIOSPWA) {
                // On iOS PWA, use screen.height to get the FULL screen including safe areas
                fullHeight = window.screen.height;
                // Calculate the safe area as the difference between screen and inner height
                safeAreaBottom = window.screen.height - window.innerHeight;
            } else if (visualViewport) {
                fullHeight = visualViewport.height;
            } else {
                fullHeight = window.innerHeight;
            }

            const vh = fullHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
            document.documentElement.style.setProperty(
                "--full-height",
                `${fullHeight}px`,
            );

            // Set safe area bottom - calculated for iOS PWA, env() for others
            if (isIOSPWA) {
                document.documentElement.style.setProperty(
                    "--safe-area-bottom",
                    `${safeAreaBottom}px`,
                );
            } else {
                // Let CSS handle it via env() - remove the property so CSS fallback works
                document.documentElement.style.removeProperty(
                    "--safe-area-bottom",
                );
            }

            // Debug info
            setDebugInfo({
                windowInnerHeight: window.innerHeight,
                visualViewportHeight: visualViewport?.height,
                screenHeight: window.screen.height,
                safeAreaBottom,
                vh: vh,
                fullHeight,
                isStandalone,
                isIOS,
                isIOSPWA,
            });
        };

        updateHeight();

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", updateHeight);
        }
        window.addEventListener("resize", updateHeight);
        window.addEventListener("orientationchange", () =>
            setTimeout(updateHeight, 100),
        );

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener(
                    "resize",
                    updateHeight,
                );
            }
            window.removeEventListener("resize", updateHeight);
            window.removeEventListener("orientationchange", updateHeight);
        };
    }, []);

    return debugInfo;
};
