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
            className={`absolute left-0 top-0 z-40 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute left-1/2 top-1/2 h-[95%] w-[90%] max-w-[900px] rounded-3xl bg-zinc-900 text-white shadow-lg transition-all duration-300 ease-in-out sm:h-[90%] sm:max-h-[500px] sm:w-[90%] ${
                    isVisible
                        ? "-translate-x-1/2 -translate-y-1/2 scale-100 opacity-100"
                        : "-translate-x-1/2 -translate-y-[45%] scale-95 opacity-0"
                } cursor-default`}
            >
                {/* close button */}
                <button
                    onClick={handleClose}
                    className="absolute right-0 top-0 z-20 m-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 p-4 text-rose-700 transition-all duration-300 ease-in-out hover:scale-[1.2] hover:bg-zinc-700"
                    style={{ boxShadow: "0 0 10px 2px rgba(0,0,0,0.5)" }}
                >
                    <i className="fa-solid fa-xmark text-2xl"></i>
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
                    {/* sticky button container */}
                    <div className="sticky bottom-0 flex h-fit w-full flex-col justify-between rounded-t-3xl bg-zinc-800 px-0 sm:absolute sm:bottom-0 sm:left-auto sm:right-0 sm:w-fit sm:flex-col sm:gap-0 sm:bg-transparent sm:shadow-transparent lg:flex-row lg:items-end">
                        {/* "All shows" and Trailer buttons */}
                        <div className="flex h-fit w-full items-center justify-center gap-2 px-2 py-2 opacity-100 lg:mb-[0px] lg:mr-[-2px]">
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
                                    openYouTube(showData.movieInfo.trailerUrl)
                                }
                            >
                                <i className="fa-brands fa-youtube"></i>
                                <p className="pl-0">Trailer</p>
                            </button>
                        </div>

                        <div className="flex h-fit w-full flex-col justify-center gap-1.5 rounded-3xl border-[1.5x] border-neutral-400 bg-zinc-900 py-2 pt-1.5 sm:bg-zinc-800">
                            <div>
                                <p className="text-xs font-semibold text-neutral-100">
                                    Vorstellung:{" "}
                                    {formatDateString(showData.date, true)} -{" "}
                                    {showData.show.time}h:
                                </p>
                            </div>
                            <div className="flex w-full items-center justify-between gap-2 px-2 sm:flex-row lg:gap-2">
                                <ShareButton
                                    title={`${showData.movieInfo.title} - ${showData.show.time}`}
                                    text={`Schau dir "${showData.movieInfo.title}" um ${showData.show.time}h mit mir an!`}
                                    isMovieCard={true}
                                    classNameBtn="flex h-fit w-full items-center justify-center text-nowrap rounded-full bg-rose-600 px-2 py-2 text-xs font-semibold text-white hover:opacity-80"
                                >
                                    <div>
                                        <p className="pl-1">Einladen</p>
                                    </div>
                                </ShareButton>
                                <a
                                    href={showData.show.iframeUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-fit w-full items-center justify-center text-nowrap rounded-full bg-rose-600 px-2 py-2 text-xs font-semibold text-white hover:opacity-80"
                                >
                                    <i className="fa-solid fa-ticket"></i>
                                    <p className="pl-1">Tickets kaufen</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </MovieAttributes>
            </div>
        </button>
    );
};

export default MovieCard;
