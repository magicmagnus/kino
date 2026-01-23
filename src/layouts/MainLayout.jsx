import Header from "../components/Header";
import MovieCard from "../components/MovieCard";
import InstallPWA from "../components/InstallPWA";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { TIMELINE_WIDTH } from "../utils/utils";
import { useShowParameter } from "../hooks/useShowParameter";

const MainLayout = () => {
    const [showCard, setShowCard] = useState(false);
    const [firstDate, setFirstDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);

    // Get show data from URL parameter
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

    // Update showCard when showData changes
    useEffect(() => {
        if (showData) {
            console.log(
                "MainLayout showData changes, updating showCard:",
                showData,
                window.innerWidth / 2,
                window.innerHeight / 2,
            );
            setShowCard({
                show: showData.show,
                movieInfo: showData.movieInfo,
                date: showData.date,
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
            });
        } else {
            setShowCard(null);
        }
    }, [showData]);

    return (
        <div className="flex min-h-[100dvh] flex-col bg-zinc-950">
            <Header isMobile={isMobile} />

            {/* {isMobile && <BottomNavBar />} */}

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
                                isMobile,
                            }}
                        />
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
                {/* <ShareButton classNameBtn="flex w-full gap-2 items-center justify-center text-md text-nowrap rounded-full bg-rose-600 px-3 py-1 font-semibold text-white hover:opacity-80">
                    <div>
                        <p className="">Teilen</p>
                    </div>
                </ShareButton> */}

                <InstallPWA />
            </div>
        </div>
    );
};

export default MainLayout;
