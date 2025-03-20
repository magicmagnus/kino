import levenshtein from "fast-levenshtein";

// Constants
export const SIMILARITY_THRESHOLD = 0.2;

export const CINEMA_LAYOUT = {
    "Kino Blaue Brücke": {
        name: "Kino Blaue Brücke",
        slug: "kino-blaue-bruecke-tuebingen",
        rooms: ["Saal Tarantino", "Saal Spielberg", "Saal Kubrick"],
    },
    "Kino Museum": {
        name: "Kino Museum",
        slug: "kino-museum-tuebingen",
        rooms: ["Saal Almodóvar", "Saal Coppola", "Saal Arsenal"],
    },
    "Kino Atelier": {
        name: "Kino Atelier",
        slug: "kino-atelier-tuebingen",
        rooms: ["Atelier"],
    },
};

/**
 * Automatically scrolls the page to the bottom.
 *
 * @param {object} page - The Puppeteer page object.
 * @returns {Promise<void>} A promise that resolves when the page has been scrolled to the bottom.
 */
export async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

/**
 * Sets the HTTP headers and navigator properties to use the German language.
 *
 * This function sets the "Accept-Language" header to "de-DE" for the given page,
 * and modifies the `navigator.language` and `navigator.languages` properties to
 * return "de-DE".
 *
 * @param {object} page - The Puppeteer page object on which to set the headers and navigator properties.
 * @returns {Promise<void>} A promise that resolves when the headers and navigator properties have been set.
 */
export async function setGermanLanguageHeaders(page) {
    await page.setExtraHTTPHeaders({
        "Accept-Language": "de-DE",
    });

    // Optionally, set the navigator.language to German
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, "language", {
            get: function () {
                return "de-DE";
            },
        });
        Object.defineProperty(navigator, "languages", {
            get: function () {
                return ["de-DE"];
            },
        });
    });
}

/**
 * Filters out duplicate movie titles from a list of movies.
 *
 * @param {Array<Object>} movieList - The list of movie objects to filter.
 * @param {string} movieList[].title - The title of the movie.
 * @returns {Array<Object>} A new list of movie objects with duplicate titles removed.
 */
export function filterDuplicateTitles(movieList) {
    const titles = movieList.map((info) => info.title);
    const duplicates = titles.filter(
        (title, index) => titles.indexOf(title) !== index,
    );
    if (duplicates.length > 0) {
        console.log(
            "\nFound duplicate titles:",
            duplicates,
            "\nremoving duplicates...",
        );
        return movieList.filter(
            (info, index) => titles.indexOf(info.title) === index,
        );
    }
    return movieList;
}

/**
 * Calculates the weighted Jaccard similarity between two titles.
 * The similarity is boosted if the first two words of the titles match.
 *
 * @param {string} title1 - The first title to compare.
 * @param {string} title2 - The second title to compare.
 * @returns {number} The weighted Jaccard similarity score between 0 and 1.
 */
function weightedJaccardSimilarity(title1, title2) {
    const words1 = title1.toLowerCase().split(/\s+/);
    const words2 = title2.toLowerCase().split(/\s+/);

    const intersection = words1.filter((word) => words2.includes(word));
    const union = new Set([...words1, ...words2]);

    // Weight words that appear at the start of the title more
    let score = intersection.length / union.size;

    // Boost similarity if the first words match
    if (words1[0] === words2[0] && words1[1] === words2[1]) {
        score += 0.2; // Adjust boost factor if needed
    }

    return Math.min(1, score); // Keep score in range [0,1]
}

/**
 * Calculates the Levenshtein similarity between two strings.
 * The similarity score is normalized between 0 and 1, where 1 means identical strings.
 *
 * @param {string} title1 - The first string to compare.
 * @param {string} title2 - The second string to compare.
 * @returns {number} The similarity score between 0 and 1.
 */
function levenshteinSimilarity(title1, title2) {
    const maxLength = Math.max(title1.length, title2.length);
    const distance = levenshtein.get(
        title1.toLowerCase(),
        title2.toLowerCase(),
    );
    return 1 - distance / maxLength; // Normalize score between 0 and 1
}

/**
 * Finds the closest matching title from a list of titles based on a combination of Jaccard and Levenshtein similarity scores.
 *
 * @param {string} title - The title to find the closest match for.
 * @param {string[]} titles - An array of titles to compare against.
 * @returns {string|null} - The closest matching title if the similarity score exceeds the threshold, otherwise null.
 */
export function findClosestMatch(title, titles) {
    let bestMatch = null;
    let highestScore = 0;

    for (let t of titles) {
        let jaccard = weightedJaccardSimilarity(title, t);
        let levenshtein = levenshteinSimilarity(title, t);

        // Adjust weights: More reliance on Jaccard, but Levenshtein still helps
        let score = 0.8 * jaccard + 0.2 * levenshtein;

        if (score > highestScore) {
            highestScore = score;
            bestMatch = t;
        }
    }

    console.log(
        "Best match for",
        title,
        "is",
        bestMatch,
        "with a similarity of",
        highestScore,
    );

    return highestScore > SIMILARITY_THRESHOLD ? bestMatch : null;
}

/**
 * Formats attributes by converting specific substrings to standardized forms.
 *
 * This function takes an array of attribute strings and checks each one for the presence
 * of the substrings "omd" or "ome" (case insensitive). If "omd" is found, it replaces the
 * attribute with "OmdU". If "ome" is found, it replaces the attribute with "OmeU".
 * Attributes that do not contain these substrings are returned unchanged.
 *
 * @param {string[]} attributes - An array of attribute strings to be formatted.
 * @returns {string[]} - A new array of attributes with the specified substrings replaced.
 */
export function formatOmduInAttributes(attributes) {
    return attributes.map((attr) => {
        if (attr.toLowerCase().includes("omd")) {
            return "OmdU";
        } else if (attr.toLowerCase().includes("ome")) {
            return "OmeU";
        }
        return attr;
    });
}

/**
 * Formats a scraped room name to match a valid room name from the CINEMA_LAYOUT.
 * (because the room name formats change often on the site,
 *  but the "core name" stays the same)
 *
 * @param {string} scrapedRoom - The room name obtained from scraping.
 * @returns {string|null} - The correctly formatted room name if found, otherwise null.
 */
export function getFormattedRoomName(scrapedRoom) {
    const validRoomNames = Object.values(CINEMA_LAYOUT).flatMap(
        (cinema) => cinema.rooms,
    );
    for (const room of validRoomNames) {
        const shortRoomName = room.replace(/^Saal\s/, "");
        if (scrapedRoom.includes(shortRoomName)) {
            return room; // Return the correctly formatted room name
        }
    }
    return null;
}

/**
 * Retrieves the cinema slug based on the provided room name.
 *
 * @param {string} room - The name of the theater room.
 * @returns {string|null} The slug of the cinema if found, otherwise null.
 */
export function getCinemaSlugByRoomname(room) {
    for (const cinema of Object.values(CINEMA_LAYOUT)) {
        if (cinema.rooms.includes(room)) {
            return cinema.slug;
        }
    }
    return null;
}

// Helper function to get theater name from room name
export async function getTheaterForRoom(roomName) {
    console.log("\tGetting theater for room", roomName);
    for (const [theaterName, theater] of Object.entries(CINEMA_LAYOUT)) {
        console.log("\tChecking theater", theaterName);
        console.log("\ttheater : ", theater);
        console.log("\trooms : ", theater.rooms);
        if (theater.rooms.includes(roomName)) {
            return theaterName;
        }
    }
    return null;
}

/**
 * Corrects the cinema inside iframe URLs for a list of shows
 * by ensuring they contain the correct cinema slug.
 *
 * @param {Array} shows - An array of show objects.
 * @returns {Array} The updated array of shows with corrected iframe URLs.
 */
export function correctIframeUrls(shows) {
    shows.forEach((show) => {
        const room = show.theater;
        const correctCinemaSlug = getCinemaSlugByRoomname(room);
        //console.log("Correcting URL for", room, "to", correctCinemaSlug);
        if (
            correctCinemaSlug &&
            !show.iframeUrl.includes(correctCinemaSlug) //if the URL doesnt contain the correct cinema
        ) {
            console.log(
                "Correcting iframe URL for",
                show.theater,
                "to",
                correctCinemaSlug,
            );
            show.iframeUrl = show.iframeUrl.replace(
                /kino-[^/]+/,
                `${correctCinemaSlug}`,
            );
        }
        //console.log("Corrected URL:", show.iframeUrl);
    });
    return shows;
}

/**
 * Formats a date string from various formats to YYYY-MM-DD.
 * Handles formats like "heute", "Mi., 13.1.", "13.1.", etc.
 *
 * @param {string} dateString - The date string to format
 * @returns {string|null} - Formatted date string in YYYY-MM-DD format, or null if parsing fails
 */
export async function formatDateString(dateString) {
    let date = dateString.trim();

    if (date.toLowerCase() === "heute") {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD
    } else {
        // Match format "Mi., 13.1." or "Mi, 13.1." or "13.1."
        const dateMatch = date.match(/(?:\w+\.?,\s*)?(\d+)\.(\d+)\./) || [];
        const [, day, month] = dateMatch;

        if (day && month) {
            const today = new Date();
            let year = today.getFullYear();

            // Pad month/day with leading zeros
            const paddedMonth = month.padStart(2, "0");
            const paddedDay = day.padStart(2, "0");

            // If month is before current month, it's likely next year
            if (parseInt(month) < today.getMonth() + 1) {
                year += 1;
            }

            return `${year}-${paddedMonth}-${paddedDay}`;
        }
    }

    console.warn(`Could not parse date: ${date}`);
    return null;
}
