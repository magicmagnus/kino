import React, { useState, useRef, useEffect } from "react";
import { useFavorites } from "../context/FavoritesContext";
import { getShowHash } from "../utils/favoritesUtils";

/**
 * Reusable Favorite Button component
 *
 * @param {Object} props
 * @param {number} props.movieId - The movie ID (required)
 * @param {Object} props.showData - The show data (optional, only for MovieCard)
 * @param {boolean} props.isCard - Whether this is in MovieCard (shows dropdown) or MoviePage (direct toggle)
 * @param {string} props.className - Additional CSS classes
 */
const FavoriteButton = ({ movieId, showData, isCard = false }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const {
        isMovieFavorite,
        isShowFavorite,
        isFavorited,
        toggleMovieFavorite,
        toggleShowFavorite,
    } = useFavorites();

    // Calculate show hash if we have show data
    const showHash = showData?.show ? getShowHash(showData.show) : null;
    const showDate = showData?.date || null;

    // Determine favorite status
    const movieIsFavorite = isMovieFavorite(movieId);
    const showIsFavorite = showHash ? isShowFavorite(showHash) : false;
    const isAnyFavorite = movieIsFavorite || showIsFavorite;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);

    // Handle button click
    const handleClick = (e) => {
        e.stopPropagation();

        if (isCard && showData) {
            // In MovieCard with show data: show dropdown with options
            setShowDropdown(!showDropdown);
        } else {
            // In MoviePage or without show data: direct movie toggle
            toggleMovieFavorite(movieId);
        }
    };

    // Handle movie favorite from dropdown
    const handleMovieFavorite = (e) => {
        e.stopPropagation();
        toggleMovieFavorite(movieId);
        // setShowDropdown(false);
    };

    // Handle show favorite from dropdown
    const handleShowFavorite = (e) => {
        e.stopPropagation();
        if (showHash && showDate) {
            toggleShowFavorite({
                movieId,
                showHash,
                date: showDate,
            });
        }
        // setShowDropdown(false);
    };

    const bookmarkSource = isAnyFavorite
        ? "/bookmark-solid-full.svg"
        : "/bookmark-regular-full.svg";

    const buttonBackground = isAnyFavorite
        ? "after:absolute after:left-0 after:top-0 after:h-6 lg:after:h-6 2xl:after:h-8 after:w-full after:bg-gradient-to-b after:from-rose-400/80 after:to-transparent"
        : "";

    return (
        <div className="relative overflow-visible" ref={dropdownRef}>
            {/* Main Button */}
            <button
                onClick={handleClick}
                className={`flex h-fit items-center justify-center`}
                title={
                    isAnyFavorite
                        ? "Aus Favoriten entfernen"
                        : "Zu Favoriten hinzufügen"
                }
            >
                <img
                    src={bookmarkSource}
                    alt="Bookmark"
                    className="h-[3.4rem] lg:h-[4.4rem] 2xl:h-[5.5rem]"
                />
            </button>

            {/* Dropdown Menu (only for MovieCard) */}
            {showDropdown && isCard && showData && (
                <div
                    className="absolute z-50 flex h-fit w-64 flex-col gap-2 rounded-xl bg-neutral-800 p-3 shadow-xl shadow-black/40 lg:w-80 lg:p-4 2xl:w-96 2xl:p-5 portrait:bottom-full portrait:right-0 portrait:mb-4 landscape:right-full landscape:top-0 landscape:mr-2 landscape:mt-2 landscape:lg:mr-3 landscape:lg:mt-3 landscape:2xl:mr-4 landscape:2xl:mt-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Movie Favorite Option */}
                    <button
                        onClick={handleMovieFavorite}
                        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm lg:text-base 2xl:text-lg ${
                            movieIsFavorite
                                ? "bg-rose-600 text-white hover:bg-rose-500"
                                : "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                        }`}
                    >
                        <i
                            className={`fa-solid fa-film lg:p-1 lg:text-lg 2xl:p-2 2xl:text-xl ${movieIsFavorite ? "text-white" : "text-rose-500"}`}
                        ></i>
                        <div>
                            <p className="font-semibold">
                                {movieIsFavorite
                                    ? "Film gemerkt"
                                    : "Film merken"}
                            </p>
                            <p
                                className={`text-xs lg:text-sm 2xl:text-base ${movieIsFavorite ? "text-rose-200" : "text-neutral-400"}`}
                            >
                                Alle Vorstellungen
                            </p>
                        </div>
                        {movieIsFavorite && (
                            <i className="fa-solid fa-check ml-auto text-white lg:p-1 lg:text-lg 2xl:p-2 2xl:text-xl"></i>
                        )}
                    </button>

                    {/* Show Favorite Option */}
                    <button
                        onClick={handleShowFavorite}
                        disabled={movieIsFavorite}
                        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm lg:text-base 2xl:text-lg ${
                            movieIsFavorite
                                ? "cursor-not-allowed bg-neutral-800 text-neutral-500"
                                : showIsFavorite
                                  ? "bg-rose-600 text-white hover:bg-rose-500"
                                  : "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                        } `}
                    >
                        <i
                            className={`fa-solid fa-clock lg:p-1 lg:text-lg 2xl:p-2 2xl:text-xl ${showIsFavorite ? "text-white" : "text-rose-500"}`}
                        ></i>
                        <div>
                            <p className="font-semibold">
                                {showIsFavorite
                                    ? "Vorstellung gemerkt"
                                    : "Vorstellung merken"}
                            </p>
                            <p
                                className={`text-xs lg:text-sm 2xl:text-base ${showIsFavorite ? "text-rose-200" : "text-neutral-400"}`}
                            >
                                {movieIsFavorite
                                    ? "Bereits über Film gemerkt"
                                    : "Nur diese Vorstellung"}
                            </p>
                        </div>
                        {showIsFavorite && !movieIsFavorite && (
                            <i className="fa-solid fa-check ml-auto text-white lg:p-1 lg:text-lg 2xl:p-2 2xl:text-xl"></i>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FavoriteButton;
