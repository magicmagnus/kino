import React from "react";

const MovieSelectionButton = (props) => {
    const { onClick, selected, text, img } = props;
    return (
        <button
            onClick={onClick}
            className={
                "flex h-10 min-w-32 rounded-lg text-xs font-semibold transition-all duration-200 hover:bg-zinc-700 hover:text-white sm:min-w-44" +
                (selected ? " bg-zinc-700 text-white" : " text-gray-200")
            }
        >
            <div className="h-10 shrink-0">
                <img
                    className="h-full w-auto rounded-l-lg object-cover"
                    src={img}
                    alt="movie"
                />
            </div>

            <div className="flex h-full w-full flex-col items-start justify-center gap-1.5 overflow-hidden text-wrap px-1.5 pr-2 text-left">
                <p className="line-clamp-2 break-words">{text}</p>
            </div>
        </button>
    );
};

export default MovieSelectionButton;
