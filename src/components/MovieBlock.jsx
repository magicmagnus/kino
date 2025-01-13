import { timeToPixels, containsOmdu } from "../utils/utils";
import movieReference from "../data/movies-reference.json";

const MovieBlock = (props) => {
    const { show, showIdx, setShowCard } = props;

    const movieInfo = movieReference[show.movieId];

    const isOmdu = containsOmdu(show.attributes);
    // when clickineg on a movie block, show the movie card
    const handleClick = (e) => {
        setShowCard({
            show: show,
            movieInfo: movieInfo,
            top: e.clientY,
            left: e.clientX,
        });
    };
    return (
        <button
            onClick={handleClick}
            key={showIdx}
            className="group absolute top-0 mt-[7px] flex h-24 rounded-lg bg-zinc-800 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-zinc-700"
            style={{
                left: `${timeToPixels(show.time)}px`,
                width: `${timeToPixels(show.endTime) - timeToPixels(show.time)}px`,
            }}
        >
            <div className="h-24 shrink-0">
                <img
                    src={movieInfo.posterUrl}
                    alt={movieInfo.title}
                    className="h-full w-auto rounded-l-lg object-cover"
                />
            </div>
            <div className="flex flex-grow flex-col justify-between gap-2 overflow-hidden px-3 pb-1.5 pt-1 text-left">
                <h1
                    className={
                        "text-sm font-semibold" +
                        (isOmdu ? " line-clamp-2" : " line-clamp-3")
                    }
                >
                    {movieInfo.title}
                </h1>
                <div className="flex flex-col gap-1">
                    {isOmdu && (
                        <div className="ml-[-0.2rem] w-fit rounded-full bg-rose-700 px-1.5 py-0.5 text-xs text-rose-200">
                            <p className="font-medium">OmdU</p>
                        </div>
                    )}

                    <p className="text-xs">
                        {show.time} - {show.endTime}
                    </p>
                </div>
            </div>
        </button>
    );
};

export default MovieBlock;
