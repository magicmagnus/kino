import React, { useState } from "react";
import MovieAttributes from "./MovieAttributes";

const MovieInfo = (props) => {
    const { movieData } = props;
    const [isExpanded, setIsExpanded] = useState(false);
    console.log("Movie data in MovieInfo:", movieData);

    return (
        <div className="sticky left-0 top-0 flex w-screen flex-col justify-end bg-zinc-950 text-white">
            <div
                className={
                    "mb-2 flex w-screen justify-start overflow-hidden transition-all duration-500 ease-in-out " +
                    (isExpanded ? "h-[550px]" : "h-12 sm:h-20")
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
                className={`relative flex w-full items-center justify-center bg-zinc-950 before:absolute before:bottom-0 before:left-0 before:h-12 before:w-full before:-translate-y-2 before:bg-gradient-to-t before:from-zinc-950 before:to-transparent before:transition-all before:duration-500 before:ease-in-out ${
                    !isExpanded
                        ? "h-0 before:h-12 before:opacity-100"
                        : "h-8 before:h-8 before:opacity-0"
                } `}
            >
                <p
                    className={`rounded-md text-center text-white transition-all duration-500 ease-in-out ${!isExpanded ? "-translate-y-10 bg-opacity-100" : ""} `}
                >
                    <i
                        className={`fa-solid ${isExpanded ? "fa-chevron-up" : "fa-chevron-down"} '} text-3xl text-white transition-all duration-300 ease-in-out hover:scale-[1.3] hover:text-rose-500`}
                    ></i>
                </p>
            </button>
        </div>
    );
};

export default MovieInfo;
