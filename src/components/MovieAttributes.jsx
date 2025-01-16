import React, { useState } from "react";
import { containsOmdu } from "../utils/utils";

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

    const [isAttributesExpanded, setIsExpanded] = useState(false);

    // Add these styles in your CSS or styled-components
    const imageStyles = {
        transition: "opacity 0.3s ease-in-out",
    };

    const placeholderStyles = {
        backgroundColor: "#2c2c2c", // Dark placeholder
        width: "100%",
        height: "100%",
    };

    // Update the image element
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isOmdu = containsOmdu(attributes);

    let omduExplainer = "";
    if (isOmdu) {
        if (isOmdu === "OmdU") {
            omduExplainer = (
                <p>
                    OmdU{" "}
                    <span className="text-xs">
                        (Original mit deutschen Untertitlen
                    </span>
                </p>
            );
        } else if (isOmdu === "OmeU") {
            omduExplainer = (
                <p>
                    OmeU{" "}
                    <span className="text-xs">
                        (Original mit englischen Untertitlen
                    </span>
                </p>
            );
        } else if (isOmdu === "OV") {
            omduExplainer = (
                <p>
                    OV{" "}
                    <span className="text-xs">
                        (Original Version ohne Untertitel)
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

    return (
        <>
            {/* container poster, title, attributes, descripction*/}
            <div
                className={
                    "relative flex h-full w-full flex-col justify-start overflow-auto sm:flex-row" +
                    (isCard ? " rounded-3xl" : "")
                }
            >
                {/* poster  */}
                <div className="w-full bg-zinc-800 sm:h-full sm:w-auto">
                    <div className="relative w-full pb-[150%] sm:aspect-[2/3] sm:h-full sm:w-auto sm:pb-0">
                        {!imageLoaded && !imageError && (
                            <div
                                className="absolute left-0 top-0 h-full w-full bg-zinc-800"
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
                        "flex flex-1 flex-col justify-start gap-4 p-4 sm:overflow-scroll " +
                        (isCard ? " sm:mb-[88px] lg:mb-12" : "")
                    }
                >
                    {/* title */}
                    <h2 className="text-left text-3xl font-semibold sm:mr-10">
                        {title}
                    </h2>

                    {/* just attributes */}
                    <div className="flex flex-col items-start justify-center gap-2 rounded-md bg-zinc-800 px-2 py-2 text-left text-sm">
                        {/* Always visible content */}
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-clock"></i>
                            <p>{durationText}</p>
                        </div>
                        {genre != "Unknown Genre" ? (
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-tags"></i>
                                <p>{genre}</p>
                            </div>
                        ) : (
                            <> </>
                        )}

                        {/* Expandable content wrapper */}
                        <div
                            className={`grid transition-all duration-300 ease-in-out ${isAttributesExpanded ? "grid-rows-[1fr]" : "-mt-3 grid-rows-[0fr]"}`}
                        >
                            <div className="overflow-hidden">
                                {director != "Unknown Director" && (
                                    <div className="flex items-center gap-2">
                                        <i className="fa-solid fa-clapperboard"></i>
                                        <p>{director}</p>
                                    </div>
                                )}
                                {actors.length > 0 && (
                                    <div className="flex items-start gap-2 pt-2">
                                        <i className="fa-solid fa-user-group pt-1"></i>
                                        <p>{actors.join(", ")}</p>
                                    </div>
                                )}
                                {releaseDate != "Unknown Release Date" && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <i className="fa-solid fa-calendar"></i>
                                        <p>Erschienen: {releaseDate}</p>
                                    </div>
                                )}
                                {originalTitle != "Unknown Original Title" && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <i className="fa-solid fa-book"></i>
                                        <p>Original Titel: "{originalTitle}"</p>
                                    </div>
                                )}
                                {production != "Unknown Production" && (
                                    <div className="flex items-start gap-2 pt-2">
                                        <i className="fa-solid fa-film pt-1"></i>
                                        <p>Produktion: {production}</p>
                                    </div>
                                )}
                                {fsk != "Unknown" && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <i className="fa-solid fa-shield"></i>
                                        <p>FSK: {fsk}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Expand button */}
                        <button
                            onClick={() => setIsExpanded(!isAttributesExpanded)}
                            className="flex h-4 w-full items-center justify-center rounded-md"
                        >
                            <i
                                className={`fa-solid ${isAttributesExpanded ? "fa-chevron-up" : "fa-chevron-down text-white"} text-base transition-all duration-300 ease-in-out hover:scale-[1.3] hover:text-rose-500`}
                            ></i>
                        </button>
                    </div>
                    {/* omdu tag */}
                    {isOmdu && (
                        <div className="flex w-fit items-center gap-2 rounded-full bg-rose-700 py-0.5 pl-1.5 pr-2 text-sm font-medium text-rose-200">
                            <i className="fa-solid fa-language"></i>
                            {omduExplainer}
                        </div>
                    )}

                    {/* description */}
                    <p className="text-left text-sm">
                        {description.split("<br>").map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                <br />
                            </React.Fragment>
                        ))}
                    </p>
                </div>

                {children}
            </div>
        </>
    );
};

export default MovieAttributes;
