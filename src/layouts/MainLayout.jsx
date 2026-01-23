import Header from "../components/Header";
import MovieCard from "../components/MovieCard";
import InstallPWA from "../components/InstallPWA";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { TIMELINE_WIDTH } from "../utils/utils";
import { useShowParameter } from "../hooks/useShowParameter";

const MainLayout = () => {
    const [firstDate, setFirstDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);

    // Get show data from URL parameter - THIS IS THE SINGLE SOURCE OF TRUTH
    const showData = useShowParameter();

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
        <div className="flex min-h-[100dvh] flex-col bg-zinc-950">
            <Header isMobile={isMobile} />

            {/* Main content wrapper */}
            <div className="relative flex-1">
                {/* Scrollable content */}
                <div className="no-scrollbar absolute inset-0 w-full overflow-y-auto">
                    <div
                        className="relative flex min-h-full flex-col"
                        style={{
                            width: `${TIMELINE_WIDTH + 24 + 24}px`,
                            minWidth: `${TIMELINE_WIDTH + 24 + 24}px`,
                        }}
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
                    <div className="fixed inset-0 z-50 h-[100dvh]">
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
