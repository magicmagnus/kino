import puppeteer from "puppeteer";
import { promises as fs } from "fs";

import dotenv from "dotenv";
dotenv.config();

import {
    autoScroll,
    setGermanLanguageHeaders,
    CINEMA_LAYOUT,
    filterDuplicateTitles,
    findClosestMatch,
    formatOmduInAttributes,
    getFormattedRoomName,
    correctIframeUrls,
    formatDateString,
} from "./utils.mjs";

//main function
async function scrapeAllSites() {
    // create a new browser instance and a new page
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true,
        devtools: false,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ["--no-sandbox", "--disable-setuid-sandbox"], // args: ['--start-maximized'],
        protocolTimeout: 600000, // Increase the protocol timeout to 5 minutes
    });

    const page = await browser.newPage();

    // Set the Accept-Language header to German
    await setGermanLanguageHeaders(page);

    // Expose the external functions so they're available in the browser context
    await page.exposeFunction("formatOmduInAttributes", formatOmduInAttributes);
    await page.exposeFunction("getFormattedRoomName", getFormattedRoomName);
    await page.exposeFunction("correctIframeUrls", correctIframeUrls);
    await page.exposeFunction("formatDateString", formatDateString);

    // ############################################################################################################

    // 1. scrape higher resolution poster URLs from one page per cinema

    // ############################################################################################################
    console.log(
        '\n\t1. Scraping higher resolution poster URLs from "non-widget pages"...\n',
    );

    let moviePosterUrls = await scrapePosterUrls(page);

    moviePosterUrls = filterDuplicateTitles(moviePosterUrls);

    console.log(
        "\nFound",
        moviePosterUrls.length,
        'moviePostersUrls from "non-widget pages"',
    );

    // // print all moviePosterUrls titles
    // for (const moviePoster of moviePosterUrls) {
    //     console.log("Movie Poster URL:", moviePoster.title);
    // }

    // ############################################################################################################

    // 2. scrape the movie attributes (except the dates/shotwimes) from one page per cinema

    // ############################################################################################################
    console.log('\n\t2. Scraping movie attributes from "widget pages"...\n');

    let movieAttributes = await scrapeMovieAttributes(page);

    // check if there are any duplicates in the titles, cause we visit multiple kino pages which might have the same movies (redundant)
    movieAttributes = filterDuplicateTitles(movieAttributes);

    console.log(
        "\nFound",
        movieAttributes.length,
        'movieAttributes from "widget pages"',
    );

    // log the forst element of the movieAttributes
    console.log("\nFirst movieAttributes element:\n\n", movieAttributes[0]);

    // ############################################################################################################

    // 3. Scrape the dates, showtimes and iframe URL from the other cinema website from the shared page

    // ############################################################################################################
    console.log(
        '\n\t3. Scraping movie dates, showtimes and iframe URLs from "programmübersicht"...\n',
    );
    let movieSchedules = await scrapeMovieSchedules(page);

    console.log(
        "Found",
        movieSchedules.length,
        'movieSchedules from "programmübersicht"',
    );

    // log the first element of the movieSchedules
    console.log("\nFirst movieSchedules element:\n\n", movieSchedules[0]);
    console.log(
        "\nwith first date element:\n\n",
        movieSchedules[0].showtimes[0],
    );

    // ############################################################################################################

    // 4. merge movieSchedules (main) with movieAttributes (extension)

    // ############################################################################################################
    console.log("\n\t4. Merging movieSchedules with movieAttributes ...\n");

    // Merge all properties of the same movie title from the two lists into one list
    let moviesMerged = mergeMovieAttributesAndSchedules(
        movieSchedules,
        movieAttributes,
    );

    console.log("\nMerged", moviesMerged.length, "into moviesMerged");

    // ############################################################################################################

    // 5. merge moviesMerged (main) with moviePosterUrls (extension)

    // ############################################################################################################
    console.log("\n\t5. Merging moviesMerged with moviePosterUrls...\n");
    for (const movie of moviesMerged) {
        const closestTitle = findClosestMatch(
            movie.title,
            moviePosterUrls.map((poster) => poster.title),
        );
        if (closestTitle) {
            const poster = moviePosterUrls.find(
                (poster) => poster.title === closestTitle,
            );
            // remove poster from the list
            // moviePosters = moviePosters.filter(p => p.title !== closestTitle);
            movie.posterUrl = poster.src;
        }
    }
    await browser.close();

    console.log(
        "\nMerged",
        moviesMerged.length,
        "into moviesMerged with added poster URLs",
    );

    // ############################################################################################################

    // 6. save the data to a file

    // ############################################################################################################
    console.log("\n\t6. Saving data to file...\n");
    await fs.writeFile(
        "src/data/source_movie_data.json",
        JSON.stringify(moviesMerged, null, 2),
    );
    console.log(
        'Data has been scraped and saved to "data/source_movie_data.json"',
    );
}

// Run the main function
scrapeAllSites().catch((error) => {
    console.error("Error in scraping:", error);
    process.exit(1);
});

// ############################################################################################################
/**
 * Scrapes movie attributes from a cinema website for each cinema in the CINEMA_LAYOUT.
 *
 * @param {object} page - The Puppeteer page object used for navigation and evaluation.
 * @returns {Promise<Array>} - A promise that resolves to an array of movie attributes.
 */
async function scrapeMovieAttributes(page) {
    let allMovieAttributes = [];
    for (const cinema in CINEMA_LAYOUT) {
        const kino = CINEMA_LAYOUT[cinema].slug;
        console.log(
            `Navigating to cinema website: https://www.kinoheld.de/kino/tuebingen/${kino}/shows/movies?mode=widget`,
        );
        await page.goto(
            `https://www.kinoheld.de/kino/tuebingen/${kino}/shows/movies?mode=widget`,
            {
                waitUntil: "networkidle0",
            },
        );

        // scroll to the bottom of the page to load all movies,
        await autoScroll(page, { scrollDelay: 100, finalWaitTime: 1000 });

        // then click on all "mehr infos" buttons to get the full movie info
        await page.evaluate(() => {
            const buttons = document.querySelectorAll(".movie__actions");
            for (const button of buttons) {
                const button1 = button.children[0];
                button1.click();
            }
            return new Promise((resolve) => setTimeout(resolve, 1000));
        });

        const movieAttributes = await page.evaluate(async (kino) => {
            //debugger;
            const movies = [];
            await new Promise((resolve) => setTimeout(resolve, 500));
            const movieItems = document.querySelectorAll(".movie");
            for (const movieItem of movieItems) {
                const descriptions = movieItem.querySelectorAll(
                    ".movie__info-description",
                );
                let description = "Unknown Description";
                if (descriptions) {
                    description = Array.from(descriptions)
                        .map((desc) => desc.textContent.trim())
                        .join("<br><br>");
                }

                const posterUrl =
                    movieItem.querySelector(".movie__image img")?.src ||
                    "Unknown Poster URL";
                // const title = movieItem.querySelector('.movie__title')?.textContent.trim() || 'Unknown Title';
                // some infos are nested in the short and long info sections
                const movieInfoShort = movieItem.querySelector(
                    ".movie__info--short",
                );
                let duration = "0";
                let fsk = "Unknown";
                let genre = "Unknown Genre";
                for (
                    let i = 0;
                    i < movieInfoShort.querySelectorAll("dt").length;
                    i++
                ) {
                    const dt = movieInfoShort
                        .querySelectorAll("dt")
                        [i].textContent.trim();
                    const dd = movieInfoShort
                        .querySelectorAll("dd")
                        [i].textContent.trim();
                    switch (dt) {
                        case "Dauer":
                            duration = dd;
                            break;
                        case "FSK":
                            fsk = dd;
                            break;
                        case "Genre":
                            genre = dd;
                            break;
                    }
                }

                const movieInfoLong =
                    movieItem.querySelector(".movie__info--long");
                let title = "Unknown Title";
                let origTitle = "Unknown Original Title";
                let production = "Unknown Production";
                let releaseDate = "Unknown Release Date";
                let distributor = "Unknown Distributor";
                let director = "Unknown Director";
                let actors = [];

                for (
                    let i = 0;
                    i < movieInfoLong.querySelectorAll("dt").length;
                    i++
                ) {
                    const dt = movieInfoLong
                        .querySelectorAll("dt")
                        [i].textContent.trim();
                    const dd = movieInfoLong.querySelectorAll("dd")[i];
                    const ddText = dd.textContent.trim();
                    switch (dt) {
                        case "Titel":
                            title = ddText;
                            break;
                        case "Originaltitel":
                            origTitle = ddText;
                            break;
                        case "Produktion":
                            production = ddText.split("\n")[0].trim();
                            break;
                        case "Erscheinungsdatum":
                            releaseDate = ddText;
                            break;
                        case "Verleih":
                            distributor = ddText;
                            break;
                        case "Regie":
                            director = ddText;
                            break;
                        case "Darsteller":
                            actors = Array.from(
                                dd.querySelectorAll("span"),
                            ).map((span) => span.textContent.trim());
                            break;
                    }
                }

                // click on the trailer button to get the trailer URL
                const trailerButton =
                    movieItem.querySelector(".movie__actions")?.children[1];
                let trailerUrl = "Unknown Trailer URL";
                if (trailerButton) {
                    trailerButton.click();
                    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for the trailer iframe to appear
                    const iframe = movieItem.querySelector("iframe");
                    if (iframe) {
                        trailerUrl = iframe.src;
                    }
                    trailerButton.click(); // close the trailer iframe
                }

                //debugger;

                // add the movie to the list
                movies.push({
                    title,
                    duration,
                    fsk,
                    genre,
                    origTitle,
                    production,
                    releaseDate,
                    distributor,
                    director,
                    description,
                    posterUrl,
                    trailerUrl,
                    actors,
                    attributes: [],
                });
            }

            return movies;
        }, kino);

        // add the movie attributes  the current kino to the list of all movie attributes
        allMovieAttributes = allMovieAttributes.concat(movieAttributes);
    }
    return allMovieAttributes;
}

/**
 * Scrapes movie schedules from the specified page.
 *
 * @param {object} page - The Puppeteer page object to interact with.
 * @returns {Promise<Array>} A promise that resolves to an array of movie schedules.
 * Each movie schedule contains the following properties:
 *   - title {string} - The title of the movie.
 *   - attributes {Array<string>} - An array of attributes related to the movie (e.g., language).
 *   - duration {string} - The duration of the movie in minutes.
 *   - showtimes {Array<object>} - An array of showtime objects, each containing:
 *     - date {string} - The date of the showtime in YYYY-MM-DD format.
 *     - shows {Array<object>} - An array of show objects, each containing:
 *       - time {string} - The time of the show.
 *       - room {string} - The name of the theater room.
 *       - attributes {Array<string>} - An array of attributes related to the show (e.g., 2D, 3D, OmdU).
 *       - iframeUrl {string} - The URL of the iframe for the show.
 */
async function scrapeMovieSchedules(page) {
    console.log(
        "Navigating to cinema website: https://tuebinger-kinos.de/programmuebersicht/",
    );

    await page.goto("https://tuebinger-kinos.de/programmuebersicht/", {
        waitUntil: "networkidle0",
    });

    // scroll to the bottom of the page to load all movies,
    await autoScroll(page, { scrollDelay: 100, finalWaitTime: 2000 });

    // prepare the page for scraping
    await page.evaluate(() => {
        // first close the cookie banner
        const closeButton = document.querySelector(".brlbs-cmpnt-close-button");
        if (closeButton) {
            closeButton.click();
        }
        // and switch to list view (easier to see all schedule dates)
        const listViewButton = document
            .querySelector(".overview-filter-header")
            .querySelector(".overview-view-button-list");
        if (listViewButton) {
            listViewButton.click();
        }
        return new Promise((resolve) => {
            //Click all possible "more dates" buttons and wait for possible updates
            const buttons1 = document.querySelectorAll(
                ".performance-item-date",
            );
            const buttons2 = document.querySelectorAll(
                ".performance-item-dates",
            );
            const buttons3 = document.querySelectorAll(
                ".performance-item-more-dates",
            );
            buttons1.forEach((button) => button.click());
            buttons2.forEach((button) => button.click());
            buttons3.forEach((button) => button.click());
            setTimeout(resolve, 1000); // Wait 1 second after clicking all buttons
        });
    });

    let allMovieDates = await page.evaluate(async () => {
        const movies = [];
        const movieItems = document.querySelectorAll(".movie-item");

        for (const movieItem of movieItems) {
            const title =
                movieItem.querySelector(".title")?.textContent.trim() ||
                "Unknown Title";
            const attributes = await window.formatOmduInAttributes(
                Array.from(movieItem.querySelectorAll(".attribute")).map(
                    (attr) => attr.textContent.trim(),
                ),
            );
            const duration =
                movieItem.querySelector(".minutes")?.textContent.trim() || "0";

            // movie-times-grids are the containers for Dates, Theater1, Theater2, ...
            let timeGrids = Array.from(
                movieItem.querySelectorAll(".movie-times-grid"),
            );
            if (timeGrids.length === 0) {
                movieItem.querySelector(".buy-ticket-button").click();
                timeGrids = Array.from(
                    movieItem.querySelectorAll(".movie-times-grid"),
                );
                console.log(
                    "No time grids found, clicked on buy ticket button",
                );
            }

            // First grid contains the dates
            const dateGrid = timeGrids[0];
            let dates = await Promise.all(
                Array.from(dateGrid.querySelectorAll(".date")).map(
                    async (dateElement) => {
                        let date = dateElement.textContent.trim();
                        return await window.formatDateString(date);
                    },
                ),
            );
            // Filter out nulls
            dates.filter(Boolean);

            const showtimes = [];

            // for each movie, loop through all dates
            for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
                const date = dates[dateIndex];
                let shows = [];

                // for each date, loop through all timeGrids (all theaters), from index 1 to skip the dateGrid
                for (
                    let gridIndex = 1;
                    gridIndex < timeGrids.length;
                    gridIndex++
                ) {
                    const performanceWrappers = timeGrids[
                        gridIndex
                    ].querySelectorAll(".performances-wrapper");
                    // Get the performance wrapper for this date index
                    const performanceWrapper = performanceWrappers[dateIndex];
                    if (!performanceWrapper) {
                        continue;
                    }
                    // for each performance wrapper (which is all shows for a day), loop through all showtimes
                    const showWrappers =
                        performanceWrapper.querySelectorAll(".show-wrapper");
                    for (
                        let showIndex = 0;
                        showIndex < showWrappers.length;
                        showIndex++
                    ) {
                        const show = showWrappers[showIndex];

                        // Store the current iframe URL before clicking (if any)
                        const previousIframeUrl =
                            document.querySelector("iframe")?.src || "";

                        // Click to load new iframe content
                        show.click();
                        const room =
                            show
                                .querySelector(".theatre-name")
                                ?.textContent.trim() || "Unknown Theater";

                        // Wait for iframe content to change or load
                        let iframeUrl = "Unknown iframe URL";
                        try {
                            await new Promise((resolve, reject) => {
                                const startTime = Date.now();
                                const maxWaitTime = 5000; // 5 seconds timeout

                                const checkIframeChanged = () => {
                                    const iframe =
                                        document.querySelector("iframe");
                                    const currentIframeUrl = iframe?.src || "";

                                    // If iframe exists and URL changed, or if we now have an iframe URL
                                    if (
                                        (iframe &&
                                            currentIframeUrl &&
                                            currentIframeUrl !==
                                                previousIframeUrl) ||
                                        (currentIframeUrl &&
                                            previousIframeUrl === "")
                                    ) {
                                        iframeUrl = currentIframeUrl;
                                        resolve();
                                        return;
                                    }

                                    // Check timeout
                                    if (Date.now() - startTime > maxWaitTime) {
                                        console.warn(
                                            "Timeout waiting for iframe URL to change",
                                        );
                                        resolve(); // Resolve anyway to continue with other shows
                                        return;
                                    }

                                    // Continue polling
                                    setTimeout(checkIframeChanged, 100);
                                };

                                // Start polling
                                checkIframeChanged();
                            });
                        } catch (error) {
                            console.error(
                                `Error waiting for iframe: ${error.message}`,
                            );
                        }

                        shows.push({
                            time:
                                show
                                    .querySelector(".showtime")
                                    ?.textContent.trim() || "Unknown Time",
                            theater: await window.getFormattedRoomName(room),
                            attributes: await window.formatOmduInAttributes(
                                Array.from(
                                    show.querySelectorAll(".attribute-logo"),
                                ).map((attr) => {
                                    let attribute =
                                        attr
                                            .querySelector(
                                                ".screen-reader-text",
                                            )
                                            ?.textContent.trim() ||
                                        attr.dataset.attribute ||
                                        "Unknown Attribute";
                                    return attribute;
                                }),
                            ),
                            iframeUrl: iframeUrl,
                        });
                    }
                }

                // manually correct the iframe URL for the shows
                shows = await window.correctIframeUrls(shows);

                showtimes.push({
                    date,
                    shows,
                });
            }
            movies.push({
                title,
                attributes,
                duration,
                showtimes,
            });
        }
        return movies;
    });
    return allMovieDates;
}

/**
 * Merges movie schedules with their corresponding attributes.
 *
 * @param {Array<Object>} movieSchedules - An array of movie schedule entries.
 * @param {Array<Object>} movieAttributes - An array of movie attribute entries.
 * @returns {Array<Object>} An array of merged movie entries, each containing both schedule and attribute information.
 */
function mergeMovieAttributesAndSchedules(movieSchedules, movieAttributes) {
    return movieSchedules.map((movieScheduleEntry, index) => {
        const closestTitle = findClosestMatch(
            movieScheduleEntry.title,
            movieAttributes.map(
                (movieAttributeEntry) => movieAttributeEntry.title,
            ),
        );
        if (closestTitle) {
            const movieInfo = movieAttributes.find(
                (movieAttributeEntry) =>
                    movieAttributeEntry.title === closestTitle,
            );
            // remove movieInfor from the list
            // allMovieInfos = allMovieInfos.filter(info => info.title !== closestTitle);
            return {
                id: index,
                ...movieInfo,
                ...movieScheduleEntry,
                attributes: movieScheduleEntry.attributes,
            }; //, title: closestTitle }; // Merge the two entries, tak the title from the dates
        } else {
            // if we don't find a close match, keep the original entry
            // but some attributes only would be in the movieInfo, so we have to add them
            return {
                id: index,
                ...movieScheduleEntry,
                duration: "0",
                fsk: "Unknown",
                genre: "Unknown Genre",
                origTitle: "Unknown Original Title",
                production: "Unknown Production",
                releaseDate: "Unknown Release Date",
                distributor: "Unknown Distributor",
                director: "Unknown Director",
                description: "Unknown Description",
                posterUrl: "/poster-template.jpg",
                trailerUrl: "Unknown Trailer URL",
                actors: [],
            };
        }
    });
}

/**
 * Scrapes movie poster URLs from the specified cinema pages.
 *
 * @param {object} page - The Puppeteer page object used for navigation and evaluation.
 * @returns {Promise<Array<{title: string, src: string}>>} - A promise that resolves to an array of objects containing movie titles and their corresponding poster URLs.
 */
async function scrapePosterUrls(page) {
    let allMoviePosters = [];

    for (const cinema in CINEMA_LAYOUT) {
        const kino = CINEMA_LAYOUT[cinema].slug;
        console.log(
            `Navigating to cinema website: https://www.kinoheld.de/kino/tuebingen/${kino}/vorstellungen`,
        );
        await page.goto(
            `https://www.kinoheld.de/kino/tuebingen/${kino}/vorstellungen`,
            {
                waitUntil: "networkidle0",
            },
        );

        // Scroll to the bottom of the page to load all movies
        await autoScroll(page, { scrollDelay: 100, finalWaitTime: 5000 });

        const moviePosters = await page.evaluate(() => {
            //debugger;
            const posters = [];
            document
                .querySelectorAll(".transition-opacity")
                .forEach((element) => {
                    if (element.tagName.toLowerCase() === "img") {
                        let alt = element.getAttribute("alt");
                        let src = element.getAttribute("src");
                        alt = alt.replace("Filmplakat von ", "");
                        posters.push({
                            title: alt,
                            src:
                                src && src.includes("kinoheld.de")
                                    ? src
                                    : "Unknown Poster URL",
                        });
                    }
                });
            return posters;
        });

        allMoviePosters = allMoviePosters.concat(moviePosters);
    }

    return allMoviePosters;
}
// ############################################################################################################
