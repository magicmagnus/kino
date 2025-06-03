import Header from "../components/Header";
import MovieCard from "../components/MovieCard";
import Footer from "../components/Footer";
import InstallPWA from "../components/InstallPWA";
import ShareButton from "../components/ShareButton";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { TIMELINE_WIDTH } from "../utils/utils";
import { findShowById } from "../utils/showLookup";

const MainLayout = () => {
    const [showCard, setShowCard] = useState(false);
    const [firstDate, setFirstDate] = useState(new Date());

    // Handle mobile viewport and scrolling
    useEffect(() => {
        if (showCard) {
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
    }, [showCard]);

    // In MainLayout.jsx - replace the hash handling useEffect
    useEffect(() => {
        const handleShowParameter = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const showParam = urlParams.get("show");

            if (showParam) {
                const showData = findShowById(showParam);
                if (showData) {
                    setShowCard({
                        show: showData.show,
                        movieInfo: showData.movieInfo,
                        date: showData.date,
                        top: window.innerHeight / 2,
                        left: window.innerWidth / 2,
                    });
                }
            } else {
                setShowCard(null);
            }
        };

        // Handle initial load
        handleShowParameter();

        // Listen for popstate events (back/forward navigation)
        window.addEventListener("popstate", handleShowParameter);

        return () => {
            window.removeEventListener("popstate", handleShowParameter);
        };
    }, []);

    return (
        <div className="flex min-h-[100dvh] flex-col bg-zinc-950">
            <Header />

            {/* Main content wrapper */}
            <div className="relative flex-1">
                {/* Scrollable content */}
                <div className="no-scrollbar absolute inset-0 w-full overflow-y-auto">
                    <div
                        className="relative flex min-h-full flex-col"
                        style={{
                            width: `${TIMELINE_WIDTH + 24 + 24}px`, // w-6 = 24px for timeline-title/name, ml-6 = 24px for timeline margin
                            minWidth: `${TIMELINE_WIDTH + 24 + 24}px`,
                        }}
                    >
                        <Outlet
                            context={{
                                showCard,
                                setShowCard,
                                firstDate,
                                setFirstDate,
                            }}
                        />
                        <Footer />
                    </div>
                </div>

                {/* Movie card */}
                {showCard && (
                    <div className="fixed inset-0 z-50 h-[100dvh]">
                        <MovieCard
                            showCard={showCard}
                            setShowCard={setShowCard}
                        />
                    </div>
                )}
            </div>

            {/* Share and Install PWA buttons */}
            <div className="fixed bottom-4 right-4 z-20 flex flex-col items-end">
                <ShareButton classNameBtn="flex w-full gap-2 items-center justify-center text-md text-nowrap rounded-full bg-rose-600 px-3 py-1 font-semibold text-white hover:opacity-80">
                    <div>
                        <p className="">Teilen</p>
                    </div>
                </ShareButton>
                <InstallPWA />
            </div>
        </div>
    );
};

export default MainLayout;
