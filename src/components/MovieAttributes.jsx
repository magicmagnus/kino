import React, { useState, useEffect } from "react";
import {
    containsOmdu,
    getOtherAttribute,
    getMovieIMDBID,
} from "../utils/utils";

import FavoriteButton from "./FavoriteButton";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { closeShowModal } from "../hooks/useShowParameter";

const MovieAttributes = (props) => {
    const {
        children,
        posterUrl,
        title,
        duration,
        genre,
        director,
        actors,
        releaseDate,
        originalTitle,
        production,
        fsk,
        attributes,
        description,
        isCard,
    } = props;

    const [isAttributesExpanded, setIsExpanded] = useState(true);
    const navigate = useNavigate();

    // ...existing code for imageStyles, placeholderStyles...
    const imageStyles = {
        transition: "opacity 0.3s ease-in-out",
    };

    const placeholderStyles = {
        backgroundColor: "#2c2c2c",
        width: "100%",
        height: "100%",
    };

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isOmdu = containsOmdu(attributes);
    const otherAttribute = getOtherAttribute(attributes);

    // Simplified event navigation handler
    const handleEventClick = (slug) => {
        if (isCard) {
            // Close modal first, then navigate
            closeShowModal();
            navigate(`/events/${slug}`);
        } else {
            navigate(`/events/${slug}`);
        }
    };

    // ...rest of component remains the same...
    let omduExplainer = "";
    if (isOmdu) {
        if (isOmdu === "OmdU") {
            omduExplainer = (
                <p>
                    Original mit deutschen Untertiteln
                    <span className="text-xs text-rose-300 2xl:text-base">
                        {" "}
                        - OmdU
                    </span>
                </p>
            );
        } else if (isOmdu === "OmeU") {
            omduExplainer = (
                <p>
                    Original mit englischen Untertiteln
                    <span className="text-xs text-rose-300 2xl:text-base">
                        {" "}
                        - OmeU
                    </span>
                </p>
            );
        } else if (isOmdu === "OV") {
            omduExplainer = (
                <p>
                    Originalversion ohne Untertitel
                    <span className="text-xs text-rose-300 2xl:text-base">
                        {" "}
                        - OV
                    </span>
                </p>
            );
        } else {
            omduExplainer = <> </>;
        }
    }

    let hours = Math.floor(duration / 60);
    let minutes = duration % 60;
    let durationText = `${hours}h ${minutes}min`;

    const [imdbUrl, setImdbUrl] = useState("");
    const [letterboxdUrl, setLetterboxdUrl] = useState("");

    useEffect(() => {
        const fetchMovieIds = async () => {
            const id = await getMovieIMDBID(title);

            if (id) {
                setImdbUrl(`https://www.imdb.com/title/${id}`);
                setLetterboxdUrl(`https://letterboxd.com/imdb/${id}/`);
            }
        };

        fetchMovieIds();
    }, [title]);

    const classNameExternalButton =
        "flex h-auto flex-shrink-0 items-center justify-center gap-1.5 rounded-lg bg-neutral-700 p-2 px-2.5 text-xs font-medium text-neutral-200 lg:px-3 lg:text-base 2xl:gap-3 lg:gap-2 2xl:px-4 2xl:text-lg hover:bg-neutral-600";

    return (
        <>
            {/* container poster, title, attributes, descripction */}
            <div
                className={
                    "relative flex h-full w-full flex-col overflow-auto portrait:flex-col landscape:flex-row" +
                    (isCard
                        ? " justify-start rounded-2xl landscape:before:absolute landscape:before:bottom-0 landscape:before:left-0 landscape:before:h-28 landscape:before:w-full landscape:before:bg-gradient-to-t landscape:before:from-neutral-950 landscape:before:to-transparent"
                        : " ")
                }
            >
                {/* poster  */}
                <div className="w-full bg-neutral-800 landscape:h-full landscape:w-auto">
                    <div className="relative w-full pb-[150%] landscape:aspect-[2/3] landscape:h-full landscape:w-auto landscape:pb-0">
                        {!imageLoaded && !imageError && (
                            <div
                                className="absolute left-0 top-0 h-full w-full bg-neutral-800"
                                style={placeholderStyles}
                            />
                        )}
                        <img
                            src={posterUrl.split("?")[0]}
                            style={{
                                ...imageStyles,
                                opacity: imageLoaded ? 1 : 0,
                                display: imageError ? "none" : "block",
                            }}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            alt={title}
                            className="absolute left-0 top-0 h-full w-full object-cover"
                        />
                    </div>
                </div>
                {/* title, attributes, descripction */}
                <div
                    className={
                        "flex w-full flex-1 flex-col justify-start gap-4 p-4 pt-0 lg:p-6 lg:pt-0 landscape:overflow-scroll landscape:2xl:p-8 landscape:2xl:pt-0 " +
                        (isCard
                            ? " portrait:mb-28 landscape:mb-20 landscape:lg:mb-24"
                            : " max-w-[750px]")
                    }
                >
                    {/* title */}

                    <h2 className="mb-0 text-left font-antonsc text-4xl leading-tight lg:text-5xl lg:leading-tight 2xl:text-6xl 2xl:leading-tight landscape:mr-12">
                        <span className="mr-2 inline-flex align-text-top lg:mr-3 2xl:mr-4">
                            {children}
                        </span>{" "}
                        {title}
                    </h2>

                    {/* just attributes */}
                    <div className="flex flex-col items-start justify-center gap-2 rounded-xl bg-neutral-800 px-2 py-2 text-left text-sm lg:text-base 2xl:text-base portrait:pb-2 landscape:block landscape:columns-2 landscape:gap-x-6 landscape:px-3">
                        {/* Always visible content */}
                        <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                            <div className="flex w-4 items-center justify-center">
                                <i className="fa-solid fa-clock"></i>
                            </div>
                            <p className="font-notoSans">{durationText}</p>
                        </div>
                        {director != "Unknown Director" && (
                            <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-clapperboard"></i>
                                </div>
                                <p className="font-notoSans">{director}</p>
                            </div>
                        )}
                        {actors.length > 0 && (
                            <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-users"></i>
                                </div>
                                <p className="font-notoSans">
                                    {actors.join(", ")}
                                </p>
                            </div>
                        )}
                        {genre != "Unknown Genre" ? (
                            <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-masks-theater"></i>
                                </div>
                                <p className="font-notoSans">{genre}</p>
                            </div>
                        ) : (
                            <> </>
                        )}
                        {fsk != "Unknown" && (
                            <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <p className="font-notoSans">FSK: {fsk}</p>
                            </div>
                        )}
                        {releaseDate != "Unknown Release Date" && (
                            <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-calendar-day"></i>
                                </div>
                                <p className="font-notoSans">
                                    Erschienen: {releaseDate}
                                </p>
                            </div>
                        )}
                        {originalTitle != "Unknown Original Title" && (
                            <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-book"></i>
                                </div>
                                <p className="font-notoSans">
                                    Original Titel: "{originalTitle}"
                                </p>
                            </div>
                        )}
                        {production != "Unknown Production" && (
                            <div className="flex break-inside-avoid items-center gap-2 landscape:mb-2">
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-film"></i>
                                </div>
                                <p className="font-notoSans">
                                    Produktion: {production}
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Button container for external links */}
                    <div className="flex h-fit w-full">
                        <div className="flex gap-2 overflow-y-scroll">
                            {/* IMDB button */}
                            {imdbUrl && (
                                <a
                                    href={imdbUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={classNameExternalButton}
                                    title="IMDb"
                                >
                                    <img
                                        src="/IMDB_Logo_2016.svg"
                                        alt="IMDb"
                                        className="w-5 lg:w-5 2xl:w-6"
                                    />
                                    <p className="pl-0">IMDb</p>
                                </a>
                            )}
                            {/* Letterboxd button */}
                            {letterboxdUrl && (
                                <a
                                    href={letterboxdUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={classNameExternalButton}
                                    title="Letterboxd"
                                >
                                    <img
                                        src="/letterboxd-decal-dots-pos-rgb copy.svg"
                                        alt="Letterboxd"
                                        className="w-5 lg:w-5 2xl:w-6"
                                    />
                                    <p className="pl-0">Letterboxd</p>
                                </a>
                            )}
                            {/* Trailer button */}
                            <button
                                onClick={() =>
                                    openYouTube(showData.movieInfo.trailerUrl)
                                }
                                className={classNameExternalButton}
                            >
                                <img
                                    src="/YouTube_Logo_2017.svg"
                                    alt="YouTube"
                                    className="w-4 lg:w-5 2xl:w-6"
                                />
                                <p className="pl-0">YouTube</p>
                            </button>
                        </div>
                    </div>
                    {/* tags omdu, otherAttribute */}
                    {(isOmdu || otherAttribute) && (
                        <div className="flex flex-col gap-2">
                            {/* omdu tag */}
                            {isOmdu && (
                                <button
                                    onClick={(e) => (
                                        e.preventDefault(),
                                        handleEventClick(
                                            slugify(isOmdu, {
                                                lower: true,
                                                strict: true,
                                            }),
                                        )
                                    )}
                                    className="flex w-fit items-center gap-1 rounded-full bg-rose-700 px-2 py-1 text-xs font-medium text-rose-200 hover:bg-rose-600 2xl:gap-2 2xl:px-3 2xl:text-base"
                                >
                                    <div className="flex w-4 items-center justify-center">
                                        <i className="fa-solid fa-language"></i>
                                    </div>
                                    {omduExplainer}
                                </button>
                            )}
                            {/* other attribute */}
                            {otherAttribute && (
                                <button
                                    onClick={(e) => (
                                        e.preventDefault(),
                                        handleEventClick(
                                            slugify(otherAttribute, {
                                                lower: true,
                                                strict: true,
                                            }),
                                        )
                                    )}
                                    className={
                                        "flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all duration-200 2xl:gap-2 2xl:px-3 2xl:text-base " +
                                        (otherAttribute === "Apéro Film"
                                            ? " bg-[#fe5e08] text-[#fef2e6] hover:bg-[#e54f07]"
                                            : " bg-pink-700 text-pink-200 hover:bg-pink-600")
                                    }
                                >
                                    <div className="flex w-4 items-center justify-center">
                                        <i
                                            className={
                                                "fa-solid " +
                                                (otherAttribute === "Apéro Film"
                                                    ? " fa-wine-glass"
                                                    : otherAttribute
                                                            .toLowerCase()
                                                            .includes("film")
                                                      ? "fa-film"
                                                      : otherAttribute
                                                              .toLowerCase()
                                                              .includes("sneak")
                                                        ? "fa-film"
                                                        : otherAttribute
                                                                .toLowerCase()
                                                                .includes("3d")
                                                          ? "fa-eye"
                                                          : "fa-tag")
                                            }
                                        ></i>
                                    </div>
                                    <p className="truncate">{otherAttribute}</p>
                                </button>
                            )}
                        </div>
                    )}

                    {/* description */}
                    <p className="text-left font-notoSans text-sm lg:text-base 2xl:text-base">
                        {description.split("<br>").map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </p>
                </div>
            </div>
        </>
    );
};

export default MovieAttributes;
