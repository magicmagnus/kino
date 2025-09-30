import React from "react";

const MovieSelectionButton = (props) => {
    const { onClick, selected, text, img } = props;
    return (
        <button
            onClick={onClick}
            className={
                "group flex h-24 min-w-56 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-rose-500 hover:text-rose-50 sm:min-w-56" +
                (selected
                    ? " bg-rose-600 text-rose-50"
                    : " bg-rose-900 text-gray-200")
            }
        >
            <div className="relative h-24 shrink-0">
                <img
                    className={
                        "h-full w-auto rounded-l-lg object-cover transition-all duration-200 group-hover:brightness-100" +
                        (selected ? "" : " brightness-50")
                    }
                    src={
                        img === "Unknown Poster URL"
                            ? "/placeholder-poster.png"
                            : img
                    }
                    alt="movie"
                />
            </div>

            <div className="flex h-full w-full flex-col items-start justify-center gap-1.5 overflow-hidden text-wrap px-1.5 pl-3 text-left">
                <p className="line-clamp-3 break-words">{text}</p>
            </div>
        </button>
    );
};

export default MovieSelectionButton;
