import React, { useState, useEffect } from "react";
import MovieAttributes from "./MovieAttributes";
import { useNavigate } from "react-router-dom";

const MovieCard = (props) => {
    const { showCard, setShowCard } = props;
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation to complete before unmounting
        setTimeout(() => setShowCard(null), 200);
    };

    function openYouTube(videoId) {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (isIOS || isAndroid) {
            // For mobile devices, try to use deep linking first
            const now = Date.now();

            // Track if the app was opened
            const appOpened = () => {
                return Date.now() - now > 500; // If more than 500ms passed, app likely opened
            };

            // Set up fallback to browser
            const fallbackTimeout = setTimeout(() => {
                if (!document.hidden) {
                    // Only open browser if our page is still visible
                    window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
                }
            }, 2000); // Give enough time for app to open

            // Listen for visibility change to clear the fallback
            const handleVisibilityChange = () => {
                if (document.hidden && appOpened()) {
                    clearTimeout(fallbackTimeout);
                }
            };

            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );

            // Clean up event listener after 2.5 seconds
            setTimeout(() => {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange,
                );
            }, 2500);

            // Try to open the app
            if (isIOS) {
                window.location.href = `youtube://watch?v=${videoId}`;
            } else {
                window.location.href = `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end;`;
            }
        } else {
            // Desktop - simply open in new tab
            window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
        }
    }

    const navigate = useNavigate();

    const handleAllShowsClick = () => {
        // Navigate immediately (will be hidden behind the modal)
        navigate(`/movie/${showCard.movieInfo.slug}`);

        // Then start the fade out animation
        setIsVisible(false);

        // Finally remove the card from DOM after animation
        setTimeout(() => {
            setShowCard(null);
        }, 200);
    };

    return (
        <button
            onClick={handleClose}
            className={`absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute left-1/2 top-1/2 h-[95%] w-[90%] max-w-[900px] rounded-3xl bg-zinc-950 text-white shadow-lg transition-all duration-300 ease-in-out sm:h-[90%] sm:max-h-[500px] sm:w-[90%] ${
                    isVisible
                        ? "-translate-x-1/2 -translate-y-1/2 scale-100 opacity-100"
                        : "-translate-x-1/2 -translate-y-[45%] scale-95 opacity-0"
                } cursor-default`}
            >
                {/* close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-0 top-0 z-20 m-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 p-4 text-rose-500 transition-all duration-300 ease-in-out hover:scale-[1.2] hover:bg-zinc-700"
                    style={{
                        boxShadow: "0 0 10px 2px rgba(0,0,0,0.5)",
                    }}
                >
                    <i className="fa-solid fa-xmark text-2xl"></i>
                </button>

                {/* container poster, title, attributes, descripction button container*/}
                <MovieAttributes
                    title={showCard.movieInfo.title}
                    posterUrl={showCard.movieInfo.posterUrl}
                    duration={showCard.movieInfo.duration.split(" ")[0]}
                    genre={showCard.movieInfo.genre}
                    director={showCard.movieInfo.director}
                    actors={showCard.movieInfo.actors}
                    releaseDate={showCard.movieInfo.releaseDate}
                    originalTitle={showCard.movieInfo.originalTitle}
                    production={showCard.movieInfo.production}
                    fsk={showCard.movieInfo.fsk}
                    attributes={showCard.show.attributes}
                    description={showCard.movieInfo.description}
                    isCard={true}
                >
                    {/* sticky button container */}
                    <div className="sticky bottom-0 flex h-fit w-full flex-col justify-between gap-2 bg-zinc-800 px-2.5 py-2 shadow-xl shadow-black sm:absolute sm:bottom-0 sm:left-auto sm:right-0 sm:w-fit sm:flex-col sm:gap-2 sm:bg-transparent lg:flex-row">
                        <div className="flex h-fit w-full items-center justify-center gap-2 opacity-100">
                            <button
                                onClick={handleAllShowsClick}
                                className="flex flex-1 items-center justify-center gap-1 text-nowrap rounded-full bg-rose-950 p-2 px-2 py-2 text-xs font-semibold text-rose-500 hover:opacity-80"
                            >
                                <i className="fa-solid fa-bars"></i>
                                <p className="pl-0">Alle Vorstellungen</p>
                            </button>

                            <button
                                className="flex flex-1 items-center justify-center gap-1 text-nowrap rounded-full bg-rose-950 p-2 px-2 py-2 text-xs font-semibold text-rose-500 hover:opacity-80"
                                onClick={() =>
                                    openYouTube(showCard.movieInfo.trailerUrl)
                                }
                            >
                                <i className="fa-brands fa-youtube"></i>
                                <p className="pl-0">Trailer</p>
                            </button>
                        </div>

                        <button className="flex-1">
                            <a
                                href={showCard.show.iframeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center text-nowrap rounded-full bg-rose-600 px-2 py-2 text-xs font-semibold text-white hover:opacity-80"
                            >
                                <i className="fa-solid fa-ticket"></i>
                                <p className="pl-1">
                                    Tickets für {showCard.show.time}h kaufen
                                </p>
                            </a>
                        </button>
                    </div>
                </MovieAttributes>
            </div>
        </button>
    );
};

export default MovieCard;
