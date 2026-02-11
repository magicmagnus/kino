import FavoriteSelectionButton from "./FavoriteSelectionButton";
import FilterModal from "./FilterModal";

const FavoriteSelectionContainer = ({
    movieFavorites,
    showFavorites,
    hiddenFavorites,
    onToggleHide,
    onRemove,
    onClearAll,
    onShowAll,
    // Filter props (new)
    filterAttributes,
    setFilterAttributes,
    availableAttributes,
}) => {
    const totalCount = movieFavorites.length + showFavorites.length;
    const hiddenCount = hiddenFavorites.size;

    return (
        <div className="sticky left-0 top-0 z-30 w-screen">
            <div className="flex h-fit w-screen flex-col border-b border-neutral-700 bg-neutral-900">
                {/* controls and filter modal */}
                <div className="flex items-center justify-between border-b border-neutral-800 px-2 py-1.5 lg:px-3 lg:py-2">
                    {/* Bulk actions */}
                    <div className="flex h-fit gap-1 lg:gap-2">
                        <button
                            onClick={onClearAll}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors lg:px-3 lg:py-2 lg:text-lg 2xl:px-5 2xl:py-3 2xl:text-xl ${
                                totalCount > 0
                                    ? "bg-neutral-800 text-rose-500 hover:bg-rose-600 hover:text-white"
                                    : "cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-50"
                            }`}
                        >
                            <i className="fa-solid fa-trash"></i>
                            <span className="inline">Alle löschen</span>
                        </button>

                        <button
                            onClick={onShowAll}
                            className={`flex h-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors lg:px-3 lg:py-2 lg:text-lg 2xl:px-5 2xl:py-3 2xl:text-xl ${
                                hiddenCount > 0
                                    ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                                    : "cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-50"
                            }`}
                        >
                            <i className="fa-solid fa-eye"></i>
                            <span className="inline">Alle einblenden</span>
                            <span className="">({hiddenCount})</span>
                        </button>
                    </div>
                    {/* Filter Modal */}
                    <FilterModal
                        filterAttributes={filterAttributes}
                        setFilterAttributes={setFilterAttributes}
                        availableAttributes={availableAttributes}
                    />
                </div>

                {/* Favorites list */}
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-2 py-1.5 lg:gap-2 lg:px-3 lg:py-2">
                    {/* Movie favorites */}
                    {movieFavorites.map((fav) => (
                        <FavoriteSelectionButton
                            key={`movie-${fav.movieId}`}
                            favorite={fav}
                            isHidden={hiddenFavorites.has(
                                `movie-${fav.movieId}`,
                            )}
                            onToggleHide={() =>
                                onToggleHide("movie", fav.movieId)
                            }
                            onRemove={() => onRemove("movie", fav.movieId)}
                            isMovie={true}
                        />
                    ))}

                    {/* Show favorites */}
                    {showFavorites.map((fav) => (
                        <FavoriteSelectionButton
                            key={`show-${fav.showHash}`}
                            favorite={fav}
                            isHidden={hiddenFavorites.has(
                                `show-${fav.showHash}`,
                            )}
                            onToggleHide={() =>
                                onToggleHide("show", fav.showHash)
                            }
                            onRemove={() => onRemove("show", fav.showHash)}
                            isMovie={false}
                        />
                    ))}

                    {/* Empty state */}
                    {totalCount === 0 && (
                        <div className="flex h-10 w-full items-center justify-center py-2 text-sm text-neutral-500">
                            <i className="fa-regular fa-bookmark mr-2"></i>
                            Keine Favoriten vorhanden
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoriteSelectionContainer;
