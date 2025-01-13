import { readFileSync, writeFileSync } from "node:fs";
import { release } from "node:os";
import slugify from "slugify";

// Define theater structure
const theaterStructure = {
    "Kino Blaue Brücke": {
        name: "Kino Blaue Brücke",
        rooms: ["Saal Tarantino", "Saal Spielberg", "Saal Kubrick"],
    },
    "Kino Museum": {
        name: "Kino Museum",
        rooms: ["Saal Almodóvar", "Saal Coppola", "Saal Arsenal"],
    },
    "Kino Atelier": {
        name: "Kino Atelier",
        rooms: ["Atelier"],
    },
};
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
    for (const [theaterName, theater] of Object.entries(theaterStructure)) {
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
    return url.split("?")[0].replace("embed/", "watch?v=").replace('-nocookie', '').split('=')[1];
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
        dateEntry.theaters = Object.keys(theaterStructure)
            // Only include theaters that have showings
            .filter((theaterName) => dateEntry.theaters[theaterName])
            .map((theaterName) => {
                const theater = dateEntry.theaters[theaterName];

                // Get the ordered room list from theaterStructure
                const orderedRooms = theaterStructure[theaterName].rooms
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
        theaters: theaterStructure,
    };
}

function transformToRoomView(sourceData) {
    const roomView = {};
    const movies = {};

    // Initialize the structure based on theaterStructure
    Object.entries(theaterStructure).forEach(([theaterName, theater]) => {
        roomView[theaterName] = {
            name: theaterName,
            rooms: theater.rooms.reduce((acc, roomName) => {
                acc[roomName] = {
                    name: roomName,
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
            rooms: theaterStructure[theaterName].rooms
                .filter((roomName) => theater.rooms[roomName]) // Only include rooms that exist in our data
                .map((roomName) => ({
                    name: roomName,
                    dates: Object.values(theater.rooms[roomName].dates).sort(
                        (a, b) => a.date.localeCompare(b.date),
                    ), // Sort dates chronologically
                })),
        }),
    );

    return {
        roomView: roomViewArray,
        movies: movies,
        theaters: theaterStructure,
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
                        const orderedRooms = theaterStructure[theaterName].rooms
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

function processMovieData(sourceFilePath) {
    try {
        const rawData = readFileSync(sourceFilePath, "utf8");
        const sourceData = JSON.parse(rawData);
        const arrayData = Array.isArray(sourceData) ? sourceData : [sourceData];

        // Transform data for all views
        const dateViewData = transformToDateView(arrayData);
        const roomViewData = transformToRoomView(arrayData);
        const movieViewData = transformToMovieView(arrayData);

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

        console.log("Transformation completed successfully!");
    } catch (error) {
        console.error("Error processing movie data:", error);
        console.error("Error details:", error.message);
    }
}

// Usage
processMovieData("src/data/source_movie_data.json");
