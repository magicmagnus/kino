import puppeteer from "puppeteer";
import { promises as fs } from "fs";
import stringSimilarity from "string-similarity";
import levenshtein from "fast-levenshtein";
import dotenv from "dotenv";
dotenv.config();

async function autoScroll(page) {
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

//main function
async function scrapeCinema() {
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true,
        devtools: false,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ["--no-sandbox", "--disable-setuid-sandbox"], // args: ['--start-maximized'],
        protocolTimeout: 300000, // Increase the protocol timeout to 5 minutes
    });
    const page = await browser.newPage();

    // Set the Accept-Language header to German
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

    let allMovieInfos = [];
    const kinos = [
        "kino-museum-tuebingen",
        "kino-atelier-tuebingen",
        "kino-blaue-bruecke-tuebingen",
    ];
    // let atelierMovies = [];

    // 1. first scrape all movie infos except the dates/shotwimes from one page
    console.log('\n\t1. Scraping movie infos from "widget pages"...\n');
    for (const kino of kinos) {
        console.log(
            `Navigating to cinema website: https://www.kinoheld.de/kino/tuebingen/${kino}/shows/movies?mode=widget`,
        );
        await page.goto(
            `https://www.kinoheld.de/kino/tuebingen/${kino}/shows/movies?mode=widget`,
            {
                waitUntil: "networkidle0",
            },
        );

        // Click all "Info" buttons and wait for possible updates
        await autoScroll(page);
        await page.evaluate(() => {
            const buttons = document.querySelectorAll(".movie__actions");
            for (const button of buttons) {
                const button1 = button.children[0];
                button1.click();
            }
            return new Promise((resolve) => setTimeout(resolve, 1000));
        });

        const movieInfos = await page.evaluate(async (kino) => {
            function formatAttributes(attributes) {
                return attributes.map((attr) => {
                    if (attr.toLowerCase().includes("omd")) {
                        return "OmdU";
                    } else if (attr.toLowerCase().includes("ome")) {
                        return "OmeU";
                    }
                    return attr;
                });
            }

            debugger;
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

                debugger;
                // extract the dates from the playTimes__slider-wrapper
                const allGrids = movieItem
                    .querySelector(".playTimes__slider-wrapper")
                    ?.querySelectorAll(".u-flex-row");

                let dates = [];
                if (allGrids) {
                    const dateGrid = allGrids[0];
                    dates = Array.from(dateGrid.children)
                        .map((dateElement) => {
                            let date = dateElement.textContent.trim();

                            if (date.toLowerCase() === "heute") {
                                const today = new Date();
                                return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD
                            } else {
                                // Match format "Mi., 13.1." or "Mi, 13.1." or "13.1."
                                const dateMatch =
                                    date.match(
                                        /(?:\w+\.?,\s*)?(\d+)\.(\d+)\./,
                                    ) || [];
                                const [, day, month] = dateMatch;

                                if (day && month) {
                                    const today = new Date();
                                    let year = today.getFullYear();

                                    // Pad month/day with leading zeros
                                    const paddedMonth = month.padStart(2, "0");
                                    const paddedDay = day.padStart(2, "0");

                                    // If month is before current month, it's likely next year
                                    if (
                                        parseInt(month) <
                                        today.getMonth() + 1
                                    ) {
                                        year += 1;
                                    }

                                    return `${year}-${paddedMonth}-${paddedDay}`;
                                }
                            }

                            console.warn(`Could not parse date: ${date}`);
                            return null;
                        })
                        .filter(Boolean); // Remove null values
                } else {
                    console.log("No date grid found for", title);
                }

                const showtimes = [];
                const timeGrids = Array.from(
                    movieItem.querySelectorAll(
                        ".playTimes__slider-wrapper .u-flex-row",
                    ),
                );
                if (timeGrids) {
                    // for each movie, loop through all dates
                    for (
                        let dateIndex = 0;
                        dateIndex < dates.length;
                        dateIndex++
                    ) {
                        const date = dates[dateIndex];
                        const shows = [];
                        debugger;

                        // for each date, loop through all timeGrids (all theaters), from index 1 to skip the dateGrid
                        for (
                            let gridIndex = 1;
                            gridIndex < timeGrids.length;
                            gridIndex++
                        ) {
                            const showWrappers = timeGrids[
                                gridIndex
                            ].querySelectorAll(".show-detail-button");
                            debugger;

                            const show = showWrappers[dateIndex];
                            debugger;
                            if (show.textContent.trim() === "-") {
                                continue;
                            }
                            let attributes = ["2D"];
                            shows.push({
                                time:
                                    show
                                        .querySelector(
                                            ".show-detail-button__label--time",
                                        )
                                        ?.textContent.trim() || "Unknown Time",
                                theater:
                                    kino.replace(
                                        "kino-atelier-tuebingen",
                                        "Atelier",
                                    ) || "Unknown Theater",
                                attributes: formatAttributes(
                                    show.querySelector(".flag-omdu")
                                        ? attributes.concat(
                                              show
                                                  .querySelector(".flag-omdu")
                                                  .textContent.trim(),
                                          )
                                        : attributes,
                                ),
                                iframeUrl: show.href || "Unknown iframe URL",
                            });
                        }
                        showtimes.push({
                            date,
                            shows,
                        });
                    }
                } else {
                    console.log("No time grids found for", title);
                }

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
                    showtimes,
                    attributes: [],
                });
            }

            return movies;
        }, kino);

        allMovieInfos = allMovieInfos.concat(movieInfos);
        // if (kino === "kino-atelier-tuebingen") {
        //     atelierMovies = movieInfos; // save the Atelier movies to a separate file
        //     console.log("Found", atelierMovies.length, 'movies from "Atelier"');
        // }
    }

    function filterDuplicateTitles(movieList) {
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

    // check if there are any duplicates in the titles, cause we visit multiple kino pages which might have the same movies (redundant)
    allMovieInfos = filterDuplicateTitles(allMovieInfos);

    console.log("\nFound", allMovieInfos.length, 'movies from "widget pages"');
    // console.log('\n\tSaving movie infos to file "source_movie_info.json"...\n');
    // await fs.writeFile('../src/data/source_movie_info.json', JSON.stringify(allMovieInfos, null, 2));

    // 2. Scrape the dates, showtimes and iframe URL from the other cinema website
    console.log(
        '\n\t2. Scraping movie dates, showtimes and iframe URLs from "programmübersicht"...\n',
    );
    console.log(
        "Navigating to cinema website: https://tuebinger-kinos.de/programmuebersicht/",
    );
    await page.goto("https://tuebinger-kinos.de/programmuebersicht/", {
        waitUntil: "networkidle0",
    });

    //Click all "more dates" buttons and wait for possible updates
    await page.evaluate(() => {
        debugger;
        const closeButton = document.querySelector(".brlbs-cmpnt-close-button");
        if (closeButton) {
            closeButton.click();
        }
        const listViewButton = document
            .querySelector(".overview-filter-header")
            .querySelector(".overview-view-button-list");
        if (listViewButton) {
            listViewButton.click();
        }
        return new Promise((resolve) => {
            //sometimes the expand button does not open all the dates so click on an extras button with class "performance-item-date"
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
        // ##################################################
        // first a couple of helper functions inside the context of the browser
        function formatAttributes(attributes) {
            return attributes.map((attr) => {
                if (attr.toLowerCase().includes("omd")) {
                    return "OmdU";
                } else if (attr.toLowerCase().includes("ome")) {
                    return "OmeU";
                }
                return attr;
            });
        }

        // the room name formats change often on the site, but the "core name" stays the same
        function getFormattedRoomName(scrapedRoom) {
            const validNames = [
                "Saal Tarantino",
                "Saal Spielberg",
                "Saal Kubrick",
                "Saal Almodóvar",
                "Saal Coppola",
                "Saal Arsenal",
                "Atelier",
            ];

            // Try to find a valid room name within the scraped value
            for (const room of validNames) {
                const shortName = room.replace(/^Saal\s/, ""); // Remove "Saal " prefix for matching
                if (scrapedRoom.includes(shortName)) {
                    return room; // Return the correctly formatted room name
                }
            }
            return null;
        }

        // self-explanatory
        function getCinemaSlugByTheater(theater) {
            const theatersAndRooms = {
                "museum-tuebingen": [
                    "Saal Almodóvar",
                    "Saal Coppola",
                    "Saal Arsenal",
                ],
                "atelier-tuebingen": ["Atelier"],
                "blaue-bruecke-tuebingen": [
                    "Saal Tarantino",
                    "Saal Spielberg",
                    "Saal Kubrick",
                ],
            };
            for (const [cinemaSlug, rooms] of Object.entries(
                theatersAndRooms,
            )) {
                if (rooms.includes(theater)) {
                    return cinemaSlug;
                }
            }
            return null;
        }

        // some iframe URLs for the widgets have the wrong cinema slug, so we have to correct them manually
        function correctIframeUrls(shows) {
            shows.forEach((show) => {
                const theater = show.theater;
                const correctCinemaSlug = getCinemaSlugByTheater(theater);
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
                        `kino-${correctCinemaSlug}`,
                    );
                }
            });
            return shows;
        }
        // ##################################################

        debugger;
        const movies = [];
        const movieItems = document.querySelectorAll(".movie-item");

        for (const movieItem of movieItems) {
            const title =
                movieItem.querySelector(".title")?.textContent.trim() ||
                "Unknown Title";
            const attributes = formatAttributes(
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
            const dates = Array.from(dateGrid.querySelectorAll(".date"))
                .map((dateElement) => {
                    let date = dateElement.textContent.trim();

                    if (date.toLowerCase() === "heute") {
                        const today = new Date();
                        return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD
                    } else {
                        // Match format "Mi., 13.1." or "Mi, 13.1." or "13.1."
                        const dateMatch =
                            date.match(/(?:\w+\.?,\s*)?(\d+)\.(\d+)\./) || [];
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
                })
                .filter(Boolean);

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
                        show.click();
                        const room =
                            show
                                .querySelector(".theatre-name")
                                ?.textContent.trim() || "Unknown Theater";

                        await new Promise((resolve) =>
                            setTimeout(resolve, 500),
                        );

                        shows.push({
                            time:
                                show
                                    .querySelector(".showtime")
                                    ?.textContent.trim() || "Unknown Time",
                            theater: getFormattedRoomName(room),

                            attributes: formatAttributes(
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

                            iframeUrl:
                                document.querySelector("iframe")?.src ||
                                "Unknown iframe URL",
                        });
                    }
                }

                // manually correct the iframe URL for the shows
                shows = correctIframeUrls(shows);

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

    console.log(
        "Found",
        allMovieDates.length,
        'movies from "programmübersicht"',
    );
    // console.log('\n\tSaving movie dates to file "source_movie_dates.json"...\n');
    // await fs.writeFile('../src/data/data/source_movie_dates.json', JSON.stringify(allMovieDates, null, 2));

    // 3. merge the two lists
    console.log("\n\t3. Merging movie infos with dates...\n");

    // Set a similarity threshold (e.g., 0.7 for 70% similarity)
    const SIMILARITY_THRESHOLD = 0.2;

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

    function levenshteinSimilarity(title1, title2) {
        const maxLength = Math.max(title1.length, title2.length);
        const distance = levenshtein.get(
            title1.toLowerCase(),
            title2.toLowerCase(),
        );
        return 1 - distance / maxLength; // Normalize score between 0 and 1
    }

    // Function to find the closest match for a given title
    function findClosestMatch(title, titles) {
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

    // // a function to fetch poster URLs from the other TMDB API, only for the movies that are not found in the widget pages
    // async function fetchPosterUrls(title) {
    //     console.log("\nFetching poster URL for", title);
    //     const API_KEY = process.env.TMDB_API_KEY;

    //     const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(title)}`;
    //     const response = await fetch(url);
    //     const data = await response.json();

    //     if (data.results && data.results.length > 0) {
    //         const posterPath = data.results[0].poster_path;
    //         console.log("\nFound poster path:", posterPath);
    //         return `https://image.tmdb.org/t/p/w500${posterPath}`;
    //     }
    //     console.log("\nNo poster path found");
    //     return "/poster-template.jpg";
    // }

    // Merge all properties of the same movie title from the two lists into one list
    let movies = allMovieDates.map((date, index) => {
        const closestTitle = findClosestMatch(
            date.title,
            allMovieInfos.map((info) => info.title),
        );
        if (closestTitle) {
            const movieInfo = allMovieInfos.find(
                (info) => info.title === closestTitle,
            );
            // remove movieInfor from the list
            // allMovieInfos = allMovieInfos.filter(info => info.title !== closestTitle);
            return {
                id: index,
                ...movieInfo,
                ...date,
                attributes: date.attributes,
            }; //, title: closestTitle }; // Merge the two entries, tak the title from the dates
        } else {
            // if we don't find a close match, keep the original entry
            // but some attributes only would be in the movieInfo, so we have to add them

            return {
                id: index,
                ...date,
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
            }; // Keep the original entry if no close match is found
        }
    });

    console.log("\nMerged", movies.length, "movies with dates and showtimes");
    //console.log('\nNo showtimes found for', allMovieInfos.length, 'movies found in "widget pages":');
    //console.log(allMovieInfos.map(info => info.title));

    // console.log(
    //     "\nAdding",
    //     atelierMovies.length,
    //     'movies from "Atelier" to the list...\n',
    // );
    // regardles of the merging before, add the Atelier movies to the list, also with the same
    // const maxIndex = Math.max(...movies.map((movie) => movie.id));
    // movies = movies.concat(
    //     atelierMovies.map((movie, index) => {
    //         return { id: maxIndex + index + 1, ...movie };
    //     }),
    // );
    // console.log(
    //     "\nAdded",
    //     atelierMovies.length,
    //     'movies from "Atelier" to the list',
    // );

    // 4. scrape higher resolution poster URLs
    console.log(
        '\n\t4. Scraping higher resolution poster URLs from "non-widget pages"...\n',
    );
    async function scrapePosterUrls() {
        const browser = await puppeteer.launch({
            defaultViewport: { width: 1920, height: 1080 },
            headless: true,
            devtools: false,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            protocolTimeout: 300000, // Increase the protocol timeout to 5 minutes
        });
        const page = await browser.newPage();

        const kinos = [
            "kino-museum-tuebingen",
            "kino-atelier-tuebingen",
            "kino-blaue-bruecke-tuebingen",
        ];
        let allMoviePosters = [];

        for (const kino of kinos) {
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
            await autoScroll(page);

            const moviePosters = await page.evaluate(() => {
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

        await browser.close();

        return allMoviePosters;
    }

    // TODO with the stringSimilarity library, find the best match for each movie title and the poster alt text
    let moviePosters = await scrapePosterUrls();

    moviePosters = filterDuplicateTitles(moviePosters);

    console.log(
        "\nFound",
        moviePosters.length,
        'movie posters from "non-widget pages"',
    );
    // console.log('\n\tSaving movie posters to file "source_movie_posters.json"...\n');
    // await fs.writeFile('../src/data/data/source_movie_posters.json', JSON.stringify(moviePosters, null, 2));

    console.log(
        "\n\t5. Merging movies with higher resolution poster URLs...\n",
    );
    for (const movie of movies) {
        const closestTitle = findClosestMatch(
            movie.title,
            moviePosters.map((poster) => poster.title),
        );
        if (closestTitle) {
            const poster = moviePosters.find(
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
        movies.length,
        "movies with higher resolution poster URLs",
    );
    // console.log('\nNo showtimes found for', moviePosters.length, 'posters found in "non-widget pages": ');
    // console.log(moviePosters.map(poster => poster.title));

    console.log("\n\tSaving data to file...\n");
    await fs.writeFile(
        "src/data/source_movie_data.json",
        JSON.stringify(movies, null, 2),
    );
    console.log(
        'Data has been scraped and saved to "data/source_movie_data.json"',
    );
}

// Run the main function
scrapeCinema().catch((error) => {
    console.error("Error in scraping:", error);
    process.exit(1);
});
