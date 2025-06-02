import { readFileSync, writeFileSync } from "node:fs";
import { release } from "node:os";
import slugify from "slugify";

import { CINEMA_LAYOUT } from "./utils.mjs";

function calculateEndTime(startTime, duration) {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const movieDuration =
        duration !== "0" ? parseInt(duration.split(" ")[0], 10) : 120;
    const endTime = new Date();
    endTime.setHours(startHours, startMinutes + movieDuration);
    const endHours = endTime.getHours().toString().padStart(2, "0");
    const endMinutes = endTime.getMinutes().toString().padStart(2, "0");
    return `${endHours}:${endMinutes}`;
}

// Helper function to get theater name from room name
function getTheaterForRoom(roomName) {
    for (const [theaterName, theater] of Object.entries(CINEMA_LAYOUT)) {
        if (theater.rooms.includes(roomName)) {
            return theaterName;
        }
    }
    return null;
}

function getSlug(title) {
    return slugify(title, {
        lower: true,
        strict: true,
        locale: "de",
    });
}

function cleanUpUrl(url) {
    if (!url) {
        return null;
    }
    return url
        .split("?")[0]
        .replace("embed/", "watch?v=")
        .replace("-nocookie", "")
        .split("=")[1];
}

// Add this function to filter and process events (similar to getOtherAttribute)
function getFilteredEvents(attributes) {
    const eventBlacklist = [
        "2D",
        "3D",
        "OmdU",
        "OmeU",
        "OV",
        "Dolby Atmos",
        "IMAX",
    ];

    return attributes
        .filter((attr) => !eventBlacklist.includes(attr))
        .filter((attr) => attr.trim().length > 0);
}

function transformToDateView(sourceData) {
    const dateView = {};
    const movies = {};

    // Helper function to ensure date exists in structure
    const ensureDateExists = (date) => {
        if (!dateView[date]) {
            dateView[date] = {
                date: date,
                theaters: {},
            };
        }
    };

    // Helper function to ensure theater exists for a date
    const ensureTheaterExists = (date, theaterName) => {
        if (!dateView[date].theaters[theaterName]) {
            dateView[date].theaters[theaterName] = {
                name: theaterName,
                rooms: {},
            };
        }
    };

    // Helper function to ensure room exists for a theater
    const ensureRoomExists = (date, theaterName, roomName) => {
        if (!dateView[date].theaters[theaterName].rooms[roomName]) {
            dateView[date].theaters[theaterName].rooms[roomName] = {
                name: roomName,
                showings: [],
            };
        }
    };

    // Process each movie
    sourceData.forEach((movie) => {
        // Store movie info separately
        movies[movie.id] = {
            id: movie.id,
            title: movie.title,
            slug: getSlug(movie.title),
            duration: movie.duration,
            fsk: movie.fsk,
            genre: movie.genre,
            originalTitle: movie.origTitle,
            production: movie.production,
            releaseDate: movie.releaseDate,
            distributor: movie.distributor,
            director: movie.director,
            description: movie.description,
            posterUrl: movie.posterUrl,
            trailerUrl: cleanUpUrl(movie.trailerUrl),
            actors: movie.actors,
            attributes: movie.attributes,
        };

        // Process showtimes
        if (movie.showtimes) {
            movie.showtimes.forEach((dateEntry) => {
                const date = dateEntry.date;

                if (dateEntry.shows && dateEntry.shows.length > 0) {
                    dateEntry.shows.forEach((show) => {
                        const roomName = show.theater;
                        const theaterName = getTheaterForRoom(roomName);

                        if (theaterName) {
                            ensureDateExists(date);
                            ensureTheaterExists(date, theaterName);
                            ensureRoomExists(date, theaterName, roomName);

                            // Add showing to appropriate room
                            dateView[date].theaters[theaterName].rooms[
                                roomName
                            ].showings.push({
                                time: show.time,
                                endTime: calculateEndTime(
                                    show.time,
                                    movie.duration,
                                ),
                                movieId: movie.id,
                                movieTitle: movie.title,
                                attributes: show.attributes,
                                iframeUrl: show.iframeUrl,
                            });
                        } else {
                            console.warn(
                                `Warning: Unknown room "${roomName}" - skipping showing`,
                            );
                        }
                    });
                }
            });
        }
    });

    // Sort showings by time within each room
    Object.values(dateView).forEach((dateEntry) => {
        Object.values(dateEntry.theaters).forEach((theater) => {
            Object.values(theater.rooms).forEach((room) => {
                room.showings.sort((a, b) => a.time.localeCompare(b.time));
            });
        });
    });

    // Convert theaters and rooms objects to arrays while maintaining order
    Object.values(dateView).forEach((dateEntry) => {
        // Get ordered theater list from theaterStructure
        dateEntry.theaters = Object.keys(CINEMA_LAYOUT)
            // Only include theaters that have showings
            .filter((theaterName) => dateEntry.theaters[theaterName])
            .map((theaterName) => {
                const theater = dateEntry.theaters[theaterName];

                // Get the ordered room list from theaterStructure
                const orderedRooms = CINEMA_LAYOUT[theaterName].rooms
                    .filter((roomName) => theater.rooms[roomName]) // Only include rooms that have showings
                    .map((roomName) => theater.rooms[roomName]);

                return {
                    ...theater,
                    rooms: orderedRooms,
                };
            });
    });

    // sort dates by date, have format yyyy-mm-dd
    const sortedDates = Object.values(dateView).sort((a, b) =>
        a.date.localeCompare(b.date),
    );

    return {
        dateView: sortedDates,
        movies: movies,
        theaters: CINEMA_LAYOUT,
    };
}

function transformToRoomView(sourceData) {
    const roomView = {};
    const movies = {};

    // Initialize the structure based on theaterStructure
    Object.entries(CINEMA_LAYOUT).forEach(([theaterName, theater]) => {
        roomView[theaterName] = {
            name: theaterName,
            rooms: theater.rooms.reduce((acc, roomName) => {
                acc[roomName] = {
                    name: roomName,
                    slug: getSlug(roomName), // Add slug for each room name
                    dates: {},
                };
                return acc;
            }, {}),
        };
    });

    // Process each movie
    sourceData.forEach((movie) => {
        // Store movie info separately (same as in dateView)
        movies[movie.id] = {
            id: movie.id,
            title: movie.title,
            slug: getSlug(movie.title),
            duration: movie.duration,
            fsk: movie.fsk,
            genre: movie.genre,
            originalTitle: movie.origTitle,
            production: movie.production,
            releaseDate: movie.releaseDate,
            distributor: movie.distributor,
            director: movie.director,
            description: movie.description,
            posterUrl: movie.posterUrl,
            trailerUrl: cleanUpUrl(movie.trailerUrl),
            actors: movie.actors,
            attributes: movie.attributes,
        };

        // Process showtimes
        if (movie.showtimes) {
            movie.showtimes.forEach((dateEntry) => {
                const date = dateEntry.date;

                if (dateEntry.shows && dateEntry.shows.length > 0) {
                    dateEntry.shows.forEach((show) => {
                        const roomName = show.theater;
                        const theaterName = getTheaterForRoom(roomName);

                        if (theaterName) {
                            // Ensure date exists for this room
                            if (
                                !roomView[theaterName].rooms[roomName].dates[
                                    date
                                ]
                            ) {
                                roomView[theaterName].rooms[roomName].dates[
                                    date
                                ] = {
                                    date: date,
                                    showings: [],
                                };
                            }

                            // Add showing to the room's date
                            roomView[theaterName].rooms[roomName].dates[
                                date
                            ].showings.push({
                                time: show.time,
                                endTime: calculateEndTime(
                                    show.time,
                                    movie.duration,
                                ),
                                movieId: movie.id,
                                movieTitle: movie.title,
                                attributes: show.attributes,
                                iframeUrl: show.iframeUrl,
                            });
                        }
                    });
                }
            });
        }
    });

    // Sort showings by time within each date
    Object.values(roomView).forEach((theater) => {
        Object.values(theater.rooms).forEach((room) => {
            Object.values(room.dates).forEach((date) => {
                date.showings.sort((a, b) => a.time.localeCompare(b.time));
            });
        });
    });

    // Convert the structure to arrays while maintaining order
    const roomViewArray = Object.entries(roomView).map(
        ([theaterName, theater]) => ({
            name: theaterName,
            rooms: CINEMA_LAYOUT[theaterName].rooms
                .filter((roomName) => theater.rooms[roomName]) // Only include rooms that exist in our data
                .map((roomName) => ({
                    name: roomName,
                    slug: theater.rooms[roomName].slug, // Add slug for each room
                    dates: Object.values(theater.rooms[roomName].dates).sort(
                        (a, b) => a.date.localeCompare(b.date),
                    ), // Sort dates chronologically
                })),
        }),
    );

    return {
        roomView: roomViewArray,
        movies: movies,
        theaters: CINEMA_LAYOUT,
    };
}

function transformToMovieView(sourceData) {
    const movieView = {};

    // First pass: create movie entries and collect all their showtimes
    sourceData.forEach((movie) => {
        movieView[movie.id] = {
            id: movie.id,
            title: movie.title,
            slug: getSlug(movie.title),
            duration: movie.duration,
            fsk: movie.fsk,
            genre: movie.genre,
            originalTitle: movie.origTitle,
            production: movie.production,
            releaseDate: movie.releaseDate,
            distributor: movie.distributor,
            director: movie.director,
            description: movie.description,
            posterUrl: movie.posterUrl,
            trailerUrl: cleanUpUrl(movie.trailerUrl),
            actors: movie.actors,
            attributes: movie.attributes,
            dates: {},
        };

        // Process showtimes
        if (movie.showtimes) {
            movie.showtimes.forEach((dateEntry) => {
                const date = dateEntry.date;

                if (dateEntry.shows && dateEntry.shows.length > 0) {
                    // Ensure date exists
                    if (!movieView[movie.id].dates[date]) {
                        movieView[movie.id].dates[date] = {
                            date: date,
                            theaters: {},
                        };
                    }

                    // Process each showing
                    dateEntry.shows.forEach((show) => {
                        const roomName = show.theater;
                        const theaterName = getTheaterForRoom(roomName);

                        if (theaterName) {
                            // Ensure theater exists for this date
                            if (
                                !movieView[movie.id].dates[date].theaters[
                                    theaterName
                                ]
                            ) {
                                movieView[movie.id].dates[date].theaters[
                                    theaterName
                                ] = {
                                    name: theaterName,
                                    rooms: {},
                                };
                            }

                            // Ensure room exists for this theater
                            if (
                                !movieView[movie.id].dates[date].theaters[
                                    theaterName
                                ].rooms[roomName]
                            ) {
                                movieView[movie.id].dates[date].theaters[
                                    theaterName
                                ].rooms[roomName] = {
                                    name: roomName,
                                    showings: [],
                                };
                            }

                            // Add showing
                            movieView[movie.id].dates[date].theaters[
                                theaterName
                            ].rooms[roomName].showings.push({
                                time: show.time,
                                endTime: calculateEndTime(
                                    show.time,
                                    movie.duration,
                                ),
                                movieId: movie.id,
                                attributes: show.attributes,
                                iframeUrl: show.iframeUrl,
                            });
                        }
                    });
                }
            });
        }
    });

    // Sort and structure the data
    return Object.values(movieView).map((movie) => {
        // Convert dates object to sorted array
        const sortedDates = Object.values(movie.dates)
            .map((date) => {
                // Convert theaters object to array with ordered rooms
                const sortedTheaters = Object.entries(date.theaters).map(
                    ([theaterName, theater]) => {
                        // Get ordered room list from theaterStructure
                        const orderedRooms = CINEMA_LAYOUT[theaterName].rooms
                            .filter((roomName) => theater.rooms[roomName]) // Only include rooms that have showings
                            .map((roomName) => {
                                const room = theater.rooms[roomName];
                                return {
                                    ...room,
                                    showings: room.showings.sort((a, b) =>
                                        a.time.localeCompare(b.time),
                                    ),
                                };
                            });

                        return {
                            name: theaterName,
                            rooms: orderedRooms,
                        };
                    },
                );

                return {
                    date: date.date,
                    theaters: sortedTheaters,
                };
            })
            .sort((a, b) => a.date.localeCompare(b.date));

        return {
            ...movie,
            dates: sortedDates,
        };
    });
}

// Add this function to create event view data
function createEventViewData(movieData) {
    const eventMap = new Map();

    // Collect all shows with their filtered events
    movieData.forEach((movie) => {
        movie.dates.forEach((dateObj) => {
            dateObj.theaters.forEach((theater) => {
                theater.rooms.forEach((room) => {
                    // Added this level!
                    room.showings.forEach((showing) => {
                        // Changed from 'shows' to 'showings'
                        const events = getFilteredEvents(showing.attributes);

                        events.forEach((event) => {
                            const eventSlug = slugify(event, {
                                lower: true,
                                strict: true,
                            });

                            if (!eventMap.has(eventSlug)) {
                                eventMap.set(eventSlug, {
                                    slug: eventSlug,
                                    name: event,
                                    dates: new Map(),
                                });
                            }

                            const eventData = eventMap.get(eventSlug);
                            const dateKey = dateObj.date;

                            if (!eventData.dates.has(dateKey)) {
                                eventData.dates.set(dateKey, {
                                    date: dateKey,
                                    theaters: new Map(),
                                });
                            }

                            const dateData = eventData.dates.get(dateKey);
                            const theaterKey = theater.name;

                            if (!dateData.theaters.has(theaterKey)) {
                                dateData.theaters.set(theaterKey, {
                                    name: theater.name,
                                    rooms: new Map(),
                                });
                            }

                            const theaterData =
                                dateData.theaters.get(theaterKey);
                            const roomKey = room.name;

                            if (!theaterData.rooms.has(roomKey)) {
                                theaterData.rooms.set(roomKey, {
                                    name: room.name,
                                    showings: [],
                                });
                            }

                            theaterData.rooms
                                .get(roomKey)
                                .showings.push(showing);
                        });
                    });
                });
            });
        });
    });

    // Convert Maps to Arrays and sort
    const eventViewData = Array.from(eventMap.values()).map((event) => ({
        ...event,
        dates: Array.from(event.dates.values())
            .map((date) => ({
                ...date,
                theaters: Array.from(date.theaters.values()).map((theater) => ({
                    ...theater,
                    rooms: Array.from(theater.rooms.values()),
                })),
            }))
            .sort((a, b) => a.date.localeCompare(b.date)),
    }));

    // Sort events alphabetically by name
    return eventViewData.sort((a, b) => a.name.localeCompare(b.name));
}

function processMovieData(sourceFilePath) {
    try {
        const rawData = readFileSync(sourceFilePath, "utf8");
        const sourceData = JSON.parse(rawData);
        const arrayData = Array.isArray(sourceData) ? sourceData : [sourceData];

        // Transform data for all views
        const dateViewData = transformToDateView(arrayData);
        const roomViewData = transformToRoomView(arrayData);
        const movieViewData = transformToMovieView(arrayData);
        const eventViewData = createEventViewData(movieViewData);

        // Write all views to files
        writeFileSync(
            "src/data/date-view.json",
            JSON.stringify(dateViewData.dateView, null, 2),
        );

        writeFileSync(
            "src/data/room-view.json",
            JSON.stringify(roomViewData.roomView, null, 2),
        );

        writeFileSync(
            "src/data/movie-view.json",
            JSON.stringify(movieViewData, null, 2),
        );

        // Write reference files
        writeFileSync(
            "src/data/movies-reference.json",
            JSON.stringify(dateViewData.movies, null, 2),
        );

        writeFileSync(
            "src/data/theaters-reference.json",
            JSON.stringify(dateViewData.theaters, null, 2),
        );

        writeFileSync(
            "src/data/event-view.json",
            JSON.stringify(eventViewData, null, 2),
        );

        console.log("Transformation completed successfully!");
    } catch (error) {
        console.error("Error processing movie data:", error);
        console.error("Error details:", error.message);
    }
}

// Usage
processMovieData("src/data/source_movie_data.json");
