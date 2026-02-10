import React, { useState } from "react";
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
    const [activeTab, setActiveTab] = useState("all"); // "all", "movies", "shows"

    const totalCount = movieFavorites.length + showFavorites.length;
    const hiddenCount = hiddenFavorites.size;

    const displayedMovies = activeTab === "shows" ? [] : movieFavorites;
    const displayedShows = activeTab === "movies" ? [] : showFavorites;

    return (
        <div className="sticky left-0 top-0 z-30 w-screen">
            <div className="flex h-fit w-screen flex-col border-b border-neutral-700 bg-neutral-900">
                {/* Tab bar and controls */}
                <div className="flex items-center justify-between border-b border-neutral-800 px-2 py-1.5 lg:px-3 lg:py-2">
                    {/* Tabs */}
                    {/* <div className="flex gap-1 lg:gap-2">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`rounded-lg px-2 py-1 text-xs transition-colors lg:px-3 lg:text-sm ${
                                activeTab === "all"
                                    ? "bg-rose-600 text-white"
                                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            }`}
                        >
                            Alle ({totalCount})
                        </button>
                        <button
                            onClick={() => setActiveTab("movies")}
                            className={`rounded-lg px-2 py-1 text-xs transition-colors lg:px-3 lg:text-sm ${
                                activeTab === "movies"
                                    ? "bg-rose-600 text-white"
                                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            }`}
                        >
                            <i className="fa-solid fa-film mr-1"></i>
                            Filme ({movieFavorites.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("shows")}
                            className={`rounded-lg px-2 py-1 text-xs transition-colors lg:px-3 lg:text-sm ${
                                activeTab === "shows"
                                    ? "bg-rose-600 text-white"
                                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                            }`}
                        >
                            <i className="fa-solid fa-clock mr-1"></i>
                            Vorstellungen ({showFavorites.length})
                        </button>
                    </div> */}

                    {/* Bulk actions */}
                    <div className="flex h-fit gap-1 lg:gap-2">
                        {totalCount > 0 && (
                            <button
                                onClick={onClearAll}
                                className="flex items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-xs text-rose-400 transition-colors hover:bg-rose-600 hover:text-white lg:px-3 lg:py-2 lg:text-lg 2xl:px-5 2xl:py-3 2xl:text-xl"
                            >
                                <i className="fa-solid fa-trash"></i>
                                <span className="inline">Alle löschen</span>
                            </button>
                        )}
                        {hiddenCount > 0 && (
                            <button
                                onClick={onShowAll}
                                className="flex h-full items-center gap-2 rounded-lg bg-neutral-800 px-3 py-2 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 lg:px-3 lg:py-2 lg:text-lg 2xl:px-5 2xl:py-3 2xl:text-xl"
                            >
                                <i className="fa-solid fa-eye"></i>
                                <span className="inline">Alle einblenden</span>
                                <span className="">({hiddenCount})</span>
                            </button>
                        )}
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
                    {displayedMovies.map((fav) => (
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
                    {displayedShows.map((fav) => (
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
