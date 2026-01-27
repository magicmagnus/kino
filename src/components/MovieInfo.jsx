import React, { useState } from "react";
import MovieAttributes from "./MovieAttributes";

const MovieInfo = (props) => {
    const { movieData } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="sticky left-0 top-0 flex w-screen flex-col justify-end bg-neutral-900 text-white">
            <div
                className={
                    "mb-2 flex w-screen justify-start overflow-hidden transition-all duration-500 ease-in-out " +
                    (isExpanded
                        ? "portrait:h-[500px] landscape:lg:h-[400px] landscape:2xl:h-[500px]"
                        : "h-12 lg:h-24")
                }
            >
                <MovieAttributes
                    posterUrl={movieData.posterUrl}
                    title={movieData.title}
                    duration={movieData.duration.split(" ")[0]}
                    genre={movieData.genre}
                    director={movieData.director}
                    actors={movieData.actors}
                    releaseDate={movieData.releaseDate}
                    originalTitle={movieData.originalTitle}
                    production={movieData.production}
                    fsk={movieData.fsk}
                    attributes={movieData.attributes}
                    description={movieData.description}
                    isCard={false}
                />
            </div>

            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`relative flex w-full items-center justify-center bg-neutral-900 before:absolute before:bottom-0 before:left-0 before:w-full before:-translate-y-2 before:bg-gradient-to-t before:from-neutral-900 before:to-transparent before:transition-all before:duration-500 before:ease-in-out ${
                    !isExpanded
                        ? "h-0 before:h-12 before:opacity-100 lg:before:h-24"
                        : "h-10 before:h-12 before:opacity-0 lg:h-12"
                } `}
            >
                <p
                    className={`flex h-8 w-24 items-center justify-center rounded-full transition-all duration-500 ease-in-out lg:h-8 lg:w-28 ${!isExpanded ? "-translate-y-8 bg-rose-50 lg:-translate-y-14" : "-translate-y-1 bg-rose-950 lg:-translate-y-0"} `}
                >
                    <i
                        className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-lg text-rose-600 transition-all duration-300 ease-in-out hover:scale-[1.3] hover:text-rose-500 lg:text-2xl`}
                    ></i>
                </p>
            </button>
        </div>
    );
};

export default MovieInfo;
