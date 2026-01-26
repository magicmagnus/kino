import React from "react";

const MovieSelectionButton = (props) => {
    const { onClick, selected, text, img } = props;
    return (
        <button
            onClick={onClick}
            className={
                "flex h-10 min-w-44 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-neutral-700 hover:text-white lg:h-12 lg:min-w-56 lg:text-sm 2xl:h-14 2xl:min-w-64 2xl:text-base" +
                (selected
                    ? " bg-neutral-600 text-white"
                    : " bg-neutral-800 text-gray-200")
            }
        >
            <div className="h-10 shrink-0 lg:h-12 2xl:h-14">
                <img
                    className="h-full w-auto rounded-l-lg object-cover"
                    src={img}
                    alt="movie"
                />
            </div>

            <div className="flex h-full w-full flex-col items-start justify-center overflow-hidden text-wrap px-2 text-left lg:px-2 2xl:px-3">
                <p className="line-clamp-2 break-words">{text}</p>
            </div>
        </button>
    );
};

export default MovieSelectionButton;
