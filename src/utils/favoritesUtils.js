import { TODAY_FORMATTED } from "./utils";

/**
 * Extract showHash from a showing's iframeUrl
 * Format: showId from URL + time (e.g., "77269-20-00")
 *
 * @param {Object} showing - The showing object
 * @returns {string|null} The show hash or null if invalid
 */
export const getShowHash = (showing) => {
    if (!showing || !showing.iframeUrl || !showing.time) {
        return null;
    }

    try {
        // Extract showId from iframeUrl
        // Example: "...show/77269?..." → "77269"
        const showIdMatch = showing.iframeUrl.match(/show\/(\d+)/);
        if (!showIdMatch) return null;

        const showId = showIdMatch[1];
        const timeFormatted = showing.time.replace(":", "-");

        return `${showId}-${timeFormatted}`;
    } catch (error) {
        console.error("Error generating show hash:", error);
        return null;
    }
};

/**
 * Expands favorites into actual showing data
 * - Movie favorites → All upcoming showings for that movie
 * - Show favorites → That specific showing (if still valid)
 *
 * @param {Array} favorites - Array of favorite objects
 * @param {Array} dateViewData - The date-view.json data
 * @param {Object} moviesReference - The movies-reference.json data
 * @returns {Array} - Array of showing objects with additional metadata
 */
export const expandFavoritesToShowings = (
    favorites,
    dateViewData,
    moviesReference,
) => {
    if (!favorites || favorites.length === 0) return [];

    const showings = [];
    const movieFavoriteIds = new Set(
        favorites.filter((f) => f.type === "movie").map((f) => f.movieId),
    );
    const showFavoriteHashes = new Set(
        favorites.filter((f) => f.type === "show").map((f) => f.showHash),
    );

    // Filter to only upcoming dates
    const upcomingDates = dateViewData.filter(
        (date) => date.date >= TODAY_FORMATTED,
    );

    // Iterate through all showings in date-view data
    upcomingDates.forEach((dateEntry) => {
        dateEntry.theaters?.forEach((theater) => {
            theater.rooms?.forEach((room) => {
                room.showings?.forEach((showing) => {
                    const movieId = showing.movieId;
                    const showHash = `${showing.iframeUrl.split("showId=")[1]?.split("&")[0] || movieId}-${showing.time.replace(":", "-")}`;

                    const isMovieFavorite = movieFavoriteIds.has(movieId);
                    const isShowFavorite = showFavoriteHashes.has(showHash);

                    if (isMovieFavorite || isShowFavorite) {
                        showings.push({
                            ...showing,
                            date: dateEntry.date,
                            theaterName: theater.name,
                            roomName: room.name,
                            movieInfo: moviesReference[movieId],
                            favoriteType: isMovieFavorite ? "movie" : "show",
                            showHash,
                        });
                    }
                });
            });
        });
    });

    // Sort by date, then by time
    showings.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });

    return showings;
};

/**
 * Filter expanded showings by attributes
 * Consistent with filter behavior on other pages
 *
 * @param {Array} expandedShowings - From expandFavoritesToShowings
 * @param {Array} filterAttributes - Array of attribute strings to filter by
 * @returns {Array} Filtered showings
 */
export const filterExpandedShowings = (expandedShowings, filterAttributes) => {
    if (!filterAttributes || filterAttributes.length === 0) {
        return expandedShowings;
    }

    return expandedShowings.filter((showing) => {
        // Check if showing has any of the filter attributes
        return filterAttributes.some((filter) =>
            showing.attributes?.some(
                (attr) => attr.toLowerCase() === filter.toLowerCase(),
            ),
        );
    });
};

/**
 * Groups expanded showings by date → theater → room
 * Same structure as EventPage for timeline compatibility
 *
 * @param {Array} expandedShowings - Array from expandFavoritesToShowings
 * @returns {Array} - Grouped data structure for TimelineGroup
 */
export const groupShowingsByDate = (expandedShowings) => {
    if (!expandedShowings || expandedShowings.length === 0) return [];

    const grouped = {};

    expandedShowings.forEach((showing) => {
        const { date, theaterName, roomName, ...showData } = showing;

        // Initialize date if needed
        if (!grouped[date]) {
            grouped[date] = {
                date,
                theaters: {},
            };
        }

        // Initialize theater if needed
        if (!grouped[date].theaters[theaterName]) {
            grouped[date].theaters[theaterName] = {
                name: theaterName,
                rooms: {},
            };
        }

        // Initialize room if needed
        if (!grouped[date].theaters[theaterName].rooms[roomName]) {
            grouped[date].theaters[theaterName].rooms[roomName] = {
                name: roomName,
                showings: [],
            };
        }

        // Add showing
        grouped[date].theaters[theaterName].rooms[roomName].showings.push(
            showData,
        );
    });

    // Convert to array format expected by TimelineGroup
    return Object.values(grouped)
        .map((dateEntry) => ({
            date: dateEntry.date,
            theaters: Object.values(dateEntry.theaters).map((theater) => ({
                name: theater.name,
                rooms: Object.values(theater.rooms).map((room) => ({
                    name: room.name,
                    showings: room.showings.sort((a, b) =>
                        a.time.localeCompare(b.time),
                    ),
                })),
            })),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Check if there are any showings to display
 */
export const hasFavoriteShowings = (groupedData) => {
    return groupedData.some((date) =>
        date.theaters?.some((theater) =>
            theater.rooms?.some((room) => room.showings?.length > 0),
        ),
    );
};

/**
 * Get unique favorites for the management panel
 * Returns a deduplicated list with counts
 *
 * @param {Array} favorites - Raw favorites from localStorage
 * @param {Array} expandedShowings - Expanded showings data
 * @param {Object} moviesReference - Movies reference data
 * @returns {Object} - { movieFavorites: [], showFavorites: [] }
 */
export const getFavoritesForManagement = (
    favorites,
    expandedShowings,
    moviesReference,
) => {
    const movieFavorites = favorites
        .filter((f) => f.type === "movie")
        .map((fav) => {
            const movie = moviesReference[fav.movieId];
            const showCount = expandedShowings.filter(
                (s) => s.movieId === fav.movieId && s.favoriteType === "movie",
            ).length;
            return {
                ...fav,
                movie,
                showCount,
            };
        })
        .filter((f) => f.movie); // Filter out movies that don't exist anymore

    const showFavorites = favorites
        .filter((f) => f.type === "show")
        .map((fav) => {
            const showing = expandedShowings.find(
                (s) => s.showHash === fav.showHash,
            );
            const movie = showing
                ? moviesReference[showing.movieId]
                : moviesReference[fav.movieId];
            return {
                ...fav,
                movie,
                showing,
                isExpired: !showing, // Show is in the past or doesn't exist
            };
        });

    return { movieFavorites, showFavorites };
};

/**
 * Get all unique attributes from expanded showings
 * Used for the filter modal to show available options
 *
 * @param {Array} expandedShowings - From expandFavoritesToShowings
 * @returns {Array} Array of unique attribute strings
 */
export const getAvailableAttributes = (expandedShowings) => {
    const attributeSet = new Set();

    expandedShowings.forEach((showing) => {
        showing.attributes?.forEach((attr) => {
            attributeSet.add(attr);
        });
    });

    return Array.from(attributeSet).sort();
};
