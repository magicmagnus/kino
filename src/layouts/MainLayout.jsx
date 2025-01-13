import Header from "../components/Header";
import MovieCard from "../components/MovieCard";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { TIMELINE_WIDTH } from "../utils/utils";

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
        </div>
    );
};

export default MainLayout;
