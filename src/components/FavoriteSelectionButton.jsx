import React from "react";
import { formatDateString } from "../utils/utils";

const FavoriteSelectionButton = ({
    favorite,
    isHidden,
    onToggleHide,
    onRemove,
    isMovie,
}) => {
    const { movie, showCount, showing, isExpired } = favorite;

    return (
        <div
            className={`flex h-10 min-w-48 items-center gap-1 rounded-lg text-xs transition-all duration-200 lg:h-12 lg:min-w-64 lg:gap-2 lg:text-sm 2xl:h-14 2xl:min-w-64 2xl:text-base ${
                isHidden
                    ? "bg-neutral-900 opacity-50"
                    : isExpired
                      ? "bg-neutral-800 opacity-60"
                      : "bg-neutral-800"
            }`}
        >
            {/* Poster */}
            <div className="h-10 shrink-0 lg:h-12 2xl:h-14">
                <img
                    className="h-full w-auto rounded-l-lg object-cover"
                    src={
                        movie?.posterUrl === "Unknown Poster URL"
                            ? "/placeholder-poster.png"
                            : movie?.posterUrl
                    }
                    alt={movie?.title || "Movie"}
                />
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-center overflow-hidden pr-1">
                <p
                    className={`truncate font-medium ${isExpired ? "text-neutral-500 line-through" : "text-white"}`}
                >
                    {movie?.title || "Unbekannter Film"}
                </p>
                <p className="truncate text-[0.65rem] text-neutral-400 lg:text-xs">
                    {isMovie ? (
                        <>
                            <i className="fa-solid fa-film mr-1 text-rose-500"></i>
                            {showCount} Vorstellung{showCount !== 1 ? "en" : ""}
                        </>
                    ) : isExpired ? (
                        <>
                            <i className="fa-solid fa-clock mr-1 text-neutral-500"></i>
                            Abgelaufen
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-clock mr-1 text-rose-500"></i>
                            {formatDateString(showing?.date)} • {showing?.time}h
                        </>
                    )}
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex h-full items-center gap-0.5 pr-1.5 lg:gap-1 lg:pr-2">
                {/* Hide/Show button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleHide();
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors lg:h-8 lg:w-8 ${
                        isHidden
                            ? "bg-neutral-600 text-white hover:bg-neutral-500"
                            : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600 hover:text-white"
                    }`}
                    title={isHidden ? "Einblenden" : "Ausblenden"}
                >
                    <i
                        className={`fa-solid ${isHidden ? "fa-eye" : "fa-eye-slash"} text-xs lg:text-sm`}
                    ></i>
                </button>

                {/* Remove button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-700 text-rose-500 transition-colors hover:bg-rose-600 hover:text-white lg:h-8 lg:w-8"
                    title="Entfernen"
                >
                    <i className="fa-solid fa-times text-xs lg:text-sm"></i>
                </button>
            </div>
        </div>
    );
};

export default FavoriteSelectionButton;
