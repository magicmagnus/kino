import Header from "../components/Header";
import MovieCard from "../components/MovieCard";
import InstallPWA from "../components/InstallPWA";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
    HOUR_WIDTH,
    HOUR_WIDTH_LARGE,
    HOUR_WIDTH_XL,
    TOTAL_HOURS,
} from "../utils/utils";
import { useShowParameter } from "../hooks/useShowParameter";
import { useViewportHeight } from "../hooks/useViewportHeight";

const MainLayout = () => {
    const [firstDate, setFirstDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);

    // Get show data from URL parameter - THIS IS THE SINGLE SOURCE OF TRUTH
    const showData = useShowParameter();

    // Fix viewport height for PWA - sets --vh CSS variable
    const debugInfo = useViewportHeight();

    // Show debug panel in development
    const showDebug = false; // Set to true to debug

    // Update mobile state based on window size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Handle mobile viewport and scrolling when modal is open
    useEffect(() => {
        if (showData) {
            // Prevent scrolling and bouncing on iOS
            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.width = "100%";
        } else {
            document.body.style.overflow = "unset";
            document.body.style.position = "static";
        }

        return () => {
            document.body.style.overflow = "unset";
            document.body.style.position = "static";
        };
    }, [showData]);

    return (
        <div
            className="flex flex-col bg-neutral-900"
            style={{ minHeight: "calc(var(--vh, 1vh) * 100)" }}
        >
            {/* Debug panel - remove in production */}
            {showDebug && process.env.NODE_ENV === "development" && (
                <div className="fixed left-2 top-16 z-[100] max-w-[200px] rounded bg-black/80 p-2 text-xs text-white">
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
            )}

            <Header isMobile={isMobile} />

            {/* Main content wrapper */}
            <div className="relative flex-1">
                {/* Scrollable content */}
                <div className="no-scrollbar absolute inset-0 w-full overflow-y-auto">
                    <div
                        style={{
                            "--hour-width": `${HOUR_WIDTH}px`,
                            "--hour-width-lg": `${HOUR_WIDTH_LARGE}px`,
                            "--hour-width-xl": `${HOUR_WIDTH_XL}px`,
                            "--total-hours": TOTAL_HOURS,
                        }}
                        className="relative mr-auto flex min-h-full w-[calc(var(--hour-width)*var(--total-hours)+4rem)] flex-col lg:w-[calc(var(--hour-width-lg)*var(--total-hours)+4rem)] 2xl:w-[calc(var(--hour-width-xl)*var(--total-hours)+4rem)]"
                    >
                        <Outlet
                            context={{
                                firstDate,
                                setFirstDate,
                                isMobile,
                                showData,
                            }}
                        />
                    </div>
                </div>

                {/* Movie card - shown when showData exists */}
                {showData && (
                    <div
                        className="fixed inset-0 z-50"
                        style={{ height: "calc(var(--vh, 1vh) * 100)" }}
                    >
                        <MovieCard showData={showData} />
                    </div>
                )}
            </div>

            {/* Install PWA button */}
            <div className="fixed bottom-4 right-4 z-20 flex flex-col items-end">
                <InstallPWA />
            </div>
        </div>
    );
};

export default MainLayout;
