import {
    timeToPixels,
    containsOmdu,
    getOtherAttribute,
    HOUR_WIDTH,
    HOUR_WIDTH_LARGE,
    HOUR_WIDTH_XL,
    TOTAL_HOURS,
    START_HOUR,
} from "../utils/utils";
import movieReference from "../data/movies-reference.json";
import { openShowModal } from "../hooks/useShowParameter";

const MovieBlock = (props) => {
    const { show, showIdx, date } = props;

    const movieInfo = movieReference[show.movieId];
    const isOmdu = containsOmdu(show.attributes);
    const otherAttribute = getOtherAttribute(show.attributes);

    const handleClick = () => {
        openShowModal(show, show.movieId);
    };

    // compute pixel positions using imported timeToPixels and expose them as CSS vars
    const left = timeToPixels(show.time, HOUR_WIDTH);
    const width = timeToPixels(show.endTime, HOUR_WIDTH) - left;
    const leftLg = timeToPixels(show.time, HOUR_WIDTH_LARGE);
    const widthLg = timeToPixels(show.endTime, HOUR_WIDTH_LARGE) - leftLg;
    const leftXl = timeToPixels(show.time, HOUR_WIDTH_XL);
    const widthXl = timeToPixels(show.endTime, HOUR_WIDTH_XL) - leftXl;

    return (
        <button
            onClick={handleClick}
            key={showIdx}
            style={{
                "--hour-width": `${HOUR_WIDTH}px`,
                "--hour-width-lg": `${HOUR_WIDTH_LARGE}px`,
                "--hour-width-xl": `${HOUR_WIDTH_XL}px`,
                "--total-hours": TOTAL_HOURS,
                "--left": `${left}px`,
                "--width": `${width}px`,
                "--left-lg": `${leftLg}px`,
                "--width-lg": `${widthLg}px`,
                "--left-xl": `${leftXl}px`,
                "--width-xl": `${widthXl}px`,
            }}
            className={`movieblock mt-px] absolute left-[var(--left)] top-0 flex h-[calc(var(--hour-width)-0.75rem)] w-[var(--width)] items-center rounded-lg bg-neutral-700 text-white transition-all duration-200 hover:scale-105 hover:bg-neutral-600 lg:left-[var(--left-lg)] lg:mt-[6px] lg:h-[calc(var(--hour-width-lg)-0.75rem)] lg:w-[var(--width-lg)] lg:rounded-lg 2xl:left-[var(--left-xl)] 2xl:mt-[8px] 2xl:h-[calc(var(--hour-width-xl)-1rem)] 2xl:w-[var(--width-xl)]`}
            // style={{
            //     left: `${timeToPixels(show.time)}px`,
            //     width: `${timeToPixels(show.endTime) - timeToPixels(show.time)}px`,
            // }}
        >
            <div className="h-full shrink-0">
                <img
                    src={
                        movieInfo.posterUrl === "Unknown Poster URL"
                            ? "/placeholder-poster.png"
                            : movieInfo.posterUrl
                    }
                    alt={movieInfo.title}
                    className="h-full w-auto rounded-l-lg object-cover lg:rounded-l-lg 2xl:rounded-l-lg"
                />
            </div>
            <div className="flex h-full flex-grow flex-col justify-between overflow-hidden px-3 py-2 text-left">
                <h1
                    className={
                        "text-sm font-semibold lg:text-base 2xl:-mt-0.5 2xl:text-lg" +
                        (isOmdu || otherAttribute
                            ? " line-clamp-2"
                            : " line-clamp-3")
                    }
                >
                    {movieInfo.title}
                </h1>
                <div className="flex flex-col gap-1 text-xs lg:text-sm 2xl:text-base">
                    <div className="mx-[-0.2rem] flex max-w-full items-center gap-1.5 overflow-hidden">
                        {otherAttribute && (
                            <div
                                className={
                                    "max-w-fit overflow-hidden rounded-full px-1.5 py-0.5 " +
                                    (otherAttribute === "Apéro Film"
                                        ? " bg-[#fe5e08] text-[#fef2e6]"
                                        : " bg-pink-700 text-pink-200")
                                }
                            >
                                <p className="truncate font-medium">
                                    {otherAttribute}
                                </p>
                            </div>
                        )}
                        {isOmdu && (
                            <div className="flex-shrink-0 rounded-full bg-rose-700 px-1.5 py-0.5 text-rose-200">
                                <p className="font-medium">{isOmdu}</p>
                            </div>
                        )}
                    </div>
                    <p className="line-clamp-1 font-notoSans">
                        {show.time} - {show.endTime}
                    </p>
                </div>
            </div>
        </button>
    );
};

export default MovieBlock;
