import React, { useState } from "react";
import { containsOmdu, getOtherAttribute } from "../utils/utils";
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
                    OmdU{" "}
                    <span className="font-notoSans text-xs">
                        (Original mit deutschen Untertiteln)
                    </span>
                </p>
            );
        } else if (isOmdu === "OmeU") {
            omduExplainer = (
                <p>
                    OmeU{" "}
                    <span className="font-notoSans text-xs">
                        (Original mit englischen Untertiteln)
                    </span>
                </p>
            );
        } else if (isOmdu === "OV") {
            omduExplainer = (
                <p>
                    OV{" "}
                    <span className="font-notoSans text-xs">
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
                        {/* trailer and favorite buttons */}
                        {children}
                    </div>
                </div>
                {/* title, attributes, descripction */}
                <div
                    className={
                        "flex w-full flex-1 flex-col justify-start gap-4 p-4 lg:p-6 landscape:overflow-scroll landscape:2xl:p-8" +
                        (isCard
                            ? " portrait:mb-28 landscape:mb-20 landscape:lg:mb-24"
                            : " max-w-[750px]")
                    }
                >
                    {/* title */}
                    <h2 className="mb-0 text-left font-antonsc text-4xl lg:mb-1 lg:text-5xl 2xl:mb-4 2xl:text-6xl landscape:mr-12">
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
                                className="flex w-fit items-center gap-1 rounded-full bg-rose-700 py-0.5 pl-[5px] pr-2 text-sm font-medium text-rose-200 2xl:text-base"
                            >
                                <div className="flex w-4 items-center justify-center">
                                    <i className="fa-solid fa-earth-americas"></i>
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
                                    "flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 pr-2 text-sm font-medium transition-all duration-200 hover:scale-105 2xl:text-base " +
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
                                                    : "fa-tag")
                                        }
                                    ></i>
                                </div>
                                <p className="truncate">{otherAttribute}</p>
                            </button>
                        )}
                    </div>

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
