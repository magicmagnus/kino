import { TODAY_FORMATTED } from "./utils";

/**
 * STEP 1: HARD FILTER - Remove past dates from data
 * Removes any dates before today and cleans up empty parent containers
 *
 * @param {Array|Object} rawData - The raw JSON data
 * @param {string} pageType - One of: "datepage", "roompage", "moviepage", "eventpage"
 * @returns {Array} - Data with past dates removed
 */
export const removePastDates = (rawData, pageType) => {
    if (!rawData) return [];

    switch (pageType) {
        case "datepage":
            // Structure: dates[] → theaters[] → rooms[] → showings[]
            // Filter at top level by date.date
            return rawData.filter((date) => date.date >= TODAY_FORMATTED);

        case "roompage":
            // Structure: theaters[] → rooms[] → dates[] → showings[]
            // Filter deep: room.dates[]
            return rawData
                .map((theater) => ({
                    ...theater,
                    rooms: theater.rooms
                        .map((room) => ({
                            ...room,
                            dates: room.dates.filter(
                                (date) => date.date >= TODAY_FORMATTED,
                            ),
                        }))
                        .filter((room) => room.dates.length > 0),
                }))
                .filter((theater) => theater.rooms.length > 0);

        case "moviepage":
        case "eventpage":
            // Structure: items[] → dates[] → theaters[] → rooms[] → showings[]
            // Filter: item.dates[]
            return rawData
                .map((item) => ({
                    ...item,
                    dates: item.dates.filter(
                        (date) => date.date >= TODAY_FORMATTED,
                    ),
                }))
                .filter((item) => item.dates.length > 0);

        default:
            return rawData;
    }
};

/**
 * STEP 2: Extract available options for SelectionButtons
 * Returns array of selectable values (dates, slugs, etc.)
 *
 * @param {Array} upcomingData - Data after removing past dates
 * @param {string} pageType - One of: "datepage", "roompage", "moviepage", "eventpage"
 * @returns {Array<string>} - Array of option identifiers
 */
export const extractAvailableOptions = (upcomingData, pageType) => {
    if (!upcomingData || upcomingData.length === 0) return [];

    switch (pageType) {
        case "datepage":
            // Extract date strings
            return upcomingData.map((date) => date.date);

        case "roompage":
            // Extract room slugs from nested structure
            const roomSlugs = [];
            upcomingData.forEach((theater) => {
                theater.rooms.forEach((room) => {
                    roomSlugs.push(room.slug);
                });
            });
            return roomSlugs;

        case "moviepage":
            // Extract movie slugs
            return upcomingData.map((movie) => movie.slug);

        case "eventpage":
            // Extract event slugs
            return upcomingData.map((event) => event.slug);

        default:
            return [];
    }
};

/**
 * STEP 4: Find the selected item's data from upcomingData
 *
 * @param {Array} upcomingData - Data after removing past dates
 * @param {string} selectedOption - The selected identifier (date, slug, etc.)
 * @param {string} pageType - One of: "datepage", "roompage", "moviepage", "eventpage"
 * @returns {Object|null} - The data for the selected option, or null if not found
 */
export const findSelectedData = (upcomingData, selectedOption, pageType) => {
    if (!upcomingData || !selectedOption) return null;

    switch (pageType) {
        case "datepage":
            // Find the date object matching selectedOption
            return (
                upcomingData.find((date) => date.date === selectedOption) ||
                null
            );

        case "roompage":
            // Find the room and include theater info
            for (const theater of upcomingData) {
                const room = theater.rooms.find(
                    (r) => r.slug === selectedOption,
                );
                if (room) {
                    return {
                        theaterName: theater.name,
                        ...room,
                    };
                }
            }
            return null;

        case "moviepage":
            // Find the movie object matching selectedOption
            return (
                upcomingData.find((movie) => movie.slug === selectedOption) ||
                null
            );

        case "eventpage":
            // Find the event object matching selectedOption
            return (
                upcomingData.find((event) => event.slug === selectedOption) ||
                null
            );

        default:
            return null;
    }
};

/**
 * STEP 5: SOFT FILTER - Apply attribute filters to selected data
 * Filters showings by attributes, cleans up empty parents
 *
 * @param {Object} selectedData - The data for the selected option
 * @param {Array<string>} filterAttributes - Array of attribute strings to filter by
 * @param {string} pageType - One of: "datepage", "roompage", "moviepage", "eventpage"
 * @returns {Object|null} - Filtered data, or original if no filters
 */
export const filterByAttributes = (
    selectedData,
    filterAttributes,
    pageType,
) => {
    // If no filters or no data, return as-is
    if (!selectedData || !filterAttributes || filterAttributes.length === 0) {
        return selectedData;
    }

    // Lowercase filter attributes for case-insensitive comparison
    const activeFilters = filterAttributes.map((attr) => attr.toLowerCase());

    // Helper: Check if a showing matches any filter
    const showingMatchesFilter = (showing) => {
        return activeFilters.some((filter) =>
            showing.attributes.some((attr) => attr.toLowerCase() === filter),
        );
    };

    // Helper: Filter showings in a room
    const filterRoomShowings = (room) => ({
        ...room,
        showings: room.showings.filter(showingMatchesFilter),
    });

    // Helper: Filter rooms and remove empty ones
    const filterRooms = (rooms) =>
        rooms
            .map(filterRoomShowings)
            .filter((room) => room.showings.length > 0);

    // Helper: Filter theaters and remove empty ones
    const filterTheaters = (theaters) =>
        theaters
            .map((theater) => ({
                ...theater,
                rooms: filterRooms(theater.rooms),
            }))
            .filter((theater) => theater.rooms.length > 0);

    switch (pageType) {
        case "datepage":
            // Structure: { date, theaters[] → rooms[] → showings[] }
            return {
                ...selectedData,
                theaters: filterTheaters(selectedData.theaters),
            };

        case "roompage":
            // Structure: { theaterName, name, slug, dates[] → showings[] }
            // Note: roompage has showings directly under dates, not nested in rooms
            return {
                ...selectedData,
                dates: selectedData.dates
                    .map((date) => ({
                        ...date,
                        showings: date.showings.filter(showingMatchesFilter),
                    }))
                    .filter((date) => date.showings.length > 0),
            };

        case "moviepage":
        case "eventpage":
            // Structure: { ..., dates[] → theaters[] → rooms[] → showings[] }
            return {
                ...selectedData,
                dates: selectedData.dates
                    .map((date) => ({
                        ...date,
                        theaters: filterTheaters(date.theaters),
                    }))
                    .filter((date) => date.theaters.length > 0),
            };

        default:
            return selectedData;
    }
};

/**
 * Check if data has any showings to display
 *
 * @param {Object} displayData - The filtered data to check
 * @param {string} pageType - One of: "datepage", "roompage", "moviepage", "eventpage"
 * @returns {boolean} - True if there are showings to display
 */
export const hasShowingsToDisplay = (displayData, pageType) => {
    if (!displayData) return false;

    switch (pageType) {
        case "datepage":
            // Check if any theater has rooms with showings
            return displayData.theaters?.some((theater) =>
                theater.rooms?.some((room) => room.showings?.length > 0),
            );

        case "roompage":
            // Check if any date has showings
            return displayData.dates?.some((date) => date.showings?.length > 0);

        case "moviepage":
        case "eventpage":
            // Check if any date has theaters with rooms with showings
            return displayData.dates?.some((date) =>
                date.theaters?.some((theater) =>
                    theater.rooms?.some((room) => room.showings?.length > 0),
                ),
            );

        default:
            return false;
    }
};

/**
 * Get the first available date from display data (for TopSection)
 *
 * @param {Object} displayData - The filtered data
 * @param {string} pageType - One of: "datepage", "roompage", "moviepage", "eventpage"
 * @returns {string|null} - First date string or null
 */
export const getFirstDate = (displayData, pageType) => {
    if (!displayData) return null;

    switch (pageType) {
        case "datepage":
            return displayData.date || null;

        case "roompage":
            return displayData.dates?.[0]?.date || null;

        case "moviepage":
        case "eventpage":
            return displayData.dates?.[0]?.date || null;

        default:
            return null;
    }
};
