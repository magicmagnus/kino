import React, { useState, useEffect } from "react";
import MovieAttributes from "./MovieAttributes";
import ShareButton from "./ShareButton";
import { useNavigate } from "react-router-dom";
import { formatDateString } from "../utils/utils";
import { closeShowModal } from "../hooks/useShowParameter";

const MovieCard = (props) => {
    const { showData } = props;
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Trigger animation after mount
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            closeShowModal();
        }, 200);
    };

    function openYouTube(videoId) {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (isIOS || isAndroid) {
            const now = Date.now();
            const appOpened = () => Date.now() - now > 500;

            const fallbackTimeout = setTimeout(() => {
                if (!document.hidden) {
                    window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
                }
            }, 2000);

            const handleVisibilityChange = () => {
                if (document.hidden && appOpened()) {
                    clearTimeout(fallbackTimeout);
                }
            };

            document.addEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            setTimeout(() => {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange,
                );
            }, 2500);

            if (isIOS) {
                window.location.href = `youtube://watch?v=${videoId}`;
            } else {
                window.location.href = `intent://www.youtube.com/watch?v=${videoId}#Intent;package=com.google.android.youtube;scheme=https;end;`;
            }
        } else {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
        }
    }

    const handleAllShowsClick = () => {
        // First close the modal by removing URL param
        closeShowModal();

        // Then navigate to movie page
        navigate(`/movies/${showData.movieInfo.slug}`);
    };

    return (
        <button
            onClick={handleClose}
            className={`absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-black/50 transition-all duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute left-1/2 top-1/2 h-[95%] w-[90%] rounded-2xl bg-neutral-900 text-white shadow-lg transition-all duration-300 ease-in-out md:max-w-[800px] lg:max-h-[650px] portrait:max-w-[500px] landscape:lg:max-w-[1000px] landscape:2xl:max-h-[750px] landscape:2xl:max-w-[1200px] ${
                    isVisible
                        ? "-translate-x-1/2 -translate-y-1/2 scale-100 opacity-100"
                        : "-translate-x-1/2 -translate-y-[45%] scale-95 opacity-0"
                } cursor-default`}
            >
                {/* close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-0 top-0 z-20 m-2 flex size-6 items-center justify-center rounded-full bg-neutral-950 p-4 text-rose-500 transition-all duration-300 ease-in-out hover:scale-[1.2] hover:bg-neutral-700 lg:m-4"
                    style={{ boxShadow: "0 0 10px 2px rgba(0,0,0,0.5)" }}
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                {/* container poster, title, attributes, description button container*/}
                <MovieAttributes
                    title={showData.movieInfo.title}
                    posterUrl={showData.movieInfo.posterUrl}
                    duration={showData.movieInfo.duration.split(" ")[0]}
                    genre={showData.movieInfo.genre}
                    director={showData.movieInfo.director}
                    actors={showData.movieInfo.actors}
                    releaseDate={showData.movieInfo.releaseDate}
                    originalTitle={showData.movieInfo.originalTitle}
                    production={showData.movieInfo.production}
                    fsk={showData.movieInfo.fsk}
                    attributes={showData.show.attributes}
                    description={showData.movieInfo.description}
                    isCard={true}
                >
                    {/* mini buttons for Trailer, Favorite,  */}

                    <div className="absolute bottom-0 left-auto right-0 flex justify-center gap-2 portrait:m-2 landscape:m-4">
                        {/* Favorite button */}
                        <button className="flex items-center justify-center gap-2 rounded-lg bg-rose-950 p-2 px-3 text-xs font-semibold text-rose-500 lg:px-4 lg:text-base 2xl:gap-3 2xl:px-4 2xl:text-base">
                            <i className="fa-solid fa-heart"></i>
                            <p className="pl-0">Favorit</p>
                        </button>
                    </div>
                </MovieAttributes>
                {/* sticky button container (bottom on mobile, bottom right on larger screens) */}
                <div className="absolute bottom-0 left-auto right-0 flex h-fit w-full flex-col justify-center gap-1.5 rounded-b-2xl border-t-2 border-neutral-700 bg-neutral-900 p-3 pt-1 landscape:w-fit landscape:rounded-bl-none landscape:rounded-tl-2xl landscape:border-t-0 landscape:bg-transparent landscape:p-4">
                    {/* wrapper with show information */}

                    <div>
                        <p className="font-notoSans text-sm font-semibold text-gray-100 landscape:lg:text-base">
                            Vorstellung: {formatDateString(showData.date, true)}{" "}
                            - {showData.show.time}h:
                        </p>
                    </div>

                    {/* button container */}
                    <div className="flex h-full gap-2">
                        {/* All shows and Share buttons */}
                        <div className="flex flex-1 flex-col gap-2 landscape:flex-row">
                            <ShareButton
                                title={`${showData.movieInfo.title} - ${showData.show.time}`}
                                text={`Schau dir "${showData.movieInfo.title}" um ${showData.show.time}h mit mir an!`}
                                isMovieCard={true}
                                classNameBtn="flex flex-1 items-center justify-center gap-1 text-nowrap rounded-lg bg-neutral-700 p-2 text-xs font-semibold text-neutral-200 hover:opacity-80 landscape:px-3 landscape:py-1 landscape:lg:px-4 landscape:lg:py-2 landscape:lg:text-base landscape:2xl:px-5 landscape:2xl:text-lg"
                            >
                                <div>
                                    <p className="pl-1">Einladen</p>
                                </div>
                            </ShareButton>
                            <button
                                onClick={handleAllShowsClick}
                                className="flex flex-1 items-center justify-center gap-1 text-nowrap rounded-lg bg-neutral-700 p-2 text-xs font-semibold text-neutral-200 hover:opacity-80 landscape:px-3 landscape:py-1 landscape:lg:px-4 landscape:lg:py-2 landscape:lg:text-base landscape:2xl:px-5 landscape:2xl:text-lg"
                            >
                                <i className="fa-solid fa-film"></i>
                                <p className="pl-1">Alle Vorstellungen</p>
                            </button>
                        </div>
                        {/* Ticket button MAIN */}
                        <a
                            href={showData.show.iframeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-auto w-full flex-1 items-center justify-center text-nowrap rounded-lg bg-rose-600 p-2 text-base font-bold text-rose-50 hover:opacity-80 landscape:px-3 landscape:py-1 landscape:text-xs landscape:lg:px-4 landscape:lg:py-2 landscape:lg:text-base landscape:2xl:px-5 landscape:2xl:text-lg"
                        >
                            <i className="fa-solid fa-ticket -rotate-45 transform text-lg landscape:text-base"></i>
                            <p className="pl-2">Tickets kaufen</p>
                        </a>
                    </div>
                </div>
            </div>
        </button>
    );
};

export default MovieCard;
