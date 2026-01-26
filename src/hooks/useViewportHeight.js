import { useEffect, useState } from "react";

export const useViewportHeight = () => {
    const [debugInfo, setDebugInfo] = useState({});

    useEffect(() => {
        const updateHeight = () => {
            // Set CSS custom property for actual viewport height
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);

            // Debug info
            setDebugInfo({
                windowInnerHeight: window.innerHeight,
                windowOuterHeight: window.outerHeight,
                documentHeight: document.documentElement.clientHeight,
                screenHeight: window.screen.height,
                availHeight: window.screen.availHeight,
                visualViewportHeight: window.visualViewport?.height,
                isStandalone: window.matchMedia("(display-mode: standalone)")
                    .matches,
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
