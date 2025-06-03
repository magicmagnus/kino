import showLookup from "../data/show-lookup.json";

/**
 * Finds a show by its hash ID (showId-time format)
 * @param {string} showHash - The hash in format "showId-time" (e.g., "75157-19:45")
 * @returns {Object|null} - Show data object or null if not found
 */
export function findShowById(showHash) {
    const showData = showLookup[showHash];

    if (!showData) {
        console.warn(`Show not found for hash: ${showHash}`);
        return null;
    }

    return {
        show: showData.show,
        movieInfo: showData.movieInfo,
        date: showData.date,
    };
}
