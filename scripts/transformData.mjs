import { readFileSync, writeFileSync } from 'node:fs';
import { release } from 'node:os';

// Define theater structure
const theaterStructure = {
    "Kino Blaue Brücke": {
        name: "Kino Blaue Brücke",
        rooms: ["Saal Tarantino", "Saal Spielberg", "Saal Kubrick"]
    },
    "Kino Museum": {
        name: "Kino Museum",
        rooms: ["Saal Almodóvar", "Saal Coppola", "Saal Arsenal"]
    },
    "Kino Atelier": {
        name: "Kino Atelier",
        rooms: ["Atelier"]
    }
};

// Helper function to get theater name from room name
function getTheaterForRoom(roomName) {
    for (const [theaterName, theater] of Object.entries(theaterStructure)) {
        if (theater.rooms.includes(roomName)) {
            return theaterName;
        }
    }
    return null;
}

function transformToDateView(sourceData) {
    const dateView = {};
    const movies = {};

    // Helper function to ensure date exists in structure
    const ensureDateExists = (date) => {
        if (!dateView[date]) {
            dateView[date] = {
                date: date,
                theaters: {}
            };
        }
    };

    // Helper function to ensure theater exists for a date
    const ensureTheaterExists = (date, theaterName) => {
        if (!dateView[date].theaters[theaterName]) {
            dateView[date].theaters[theaterName] = {
                name: theaterName,
                rooms: {}
            };
        }
    };

    // Helper function to ensure room exists for a theater
    const ensureRoomExists = (date, theaterName, roomName) => {
        if (!dateView[date].theaters[theaterName].rooms[roomName]) {
            dateView[date].theaters[theaterName].rooms[roomName] = {
                name: roomName,
                showings: []
            };
        }
    };

    // Process each movie
    sourceData.forEach(movie => {
        // Store movie info separately
        movies[movie.id] = {
            id: movie.id,
            title: movie.title,
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
            trailerUrl: movie.trailerUrl,
            actors: movie.actors,
            attributes: movie.attributes
        };

        // Process showtimes
        if (movie.showtimes) {
            movie.showtimes.forEach(dateEntry => {
                const date = dateEntry.date;
                
                if (dateEntry.shows && dateEntry.shows.length > 0) {
                    dateEntry.shows.forEach(show => {
                        const roomName = show.theater;
                        const theaterName = getTheaterForRoom(roomName);
                        
                        if (theaterName) {
                            ensureDateExists(date);
                            ensureTheaterExists(date, theaterName);
                            ensureRoomExists(date, theaterName, roomName);

                            // Add showing to appropriate room
                            dateView[date].theaters[theaterName].rooms[roomName].showings.push({
                                time: show.time,
                                movieId: movie.id,
                                movieTitle: movie.title,
                                attributes: show.attributes,
                                iframeUrl: show.iframeUrl
                            });
                        } else {
                            console.warn(`Warning: Unknown room "${roomName}" - skipping showing`);
                        }
                    });
                }
            });
        }
    });

    // Sort showings by time within each room
    Object.values(dateView).forEach(dateEntry => {
        Object.values(dateEntry.theaters).forEach(theater => {
            Object.values(theater.rooms).forEach(room => {
                room.showings.sort((a, b) => a.time.localeCompare(b.time));
            });
        });
    });

    // Convert theaters and rooms objects to arrays while maintaining order
    Object.values(dateView).forEach(dateEntry => {
        dateEntry.theaters = Object.entries(dateEntry.theaters).map(([theaterName, theater]) => {
            // Get the ordered room list from theaterStructure
            const orderedRooms = theaterStructure[theaterName].rooms
                .filter(roomName => theater.rooms[roomName]) // Only include rooms that have showings
                .map(roomName => theater.rooms[roomName]);

            return {
                ...theater,
                rooms: orderedRooms
            };
        });
    });

    return {
        dateView: Object.values(dateView),
        movies: movies,
        theaters: theaterStructure
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
                    dates: {}
                };
                return acc;
            }, {})
        };
    });

    // Process each movie
    sourceData.forEach(movie => {
        // Store movie info separately (same as in dateView)
        movies[movie.id] = {
            id: movie.id,
            title: movie.title,
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
            trailerUrl: movie.trailerUrl,
            actors: movie.actors,
            attributes: movie.attributes
        };

        // Process showtimes
        if (movie.showtimes) {
            movie.showtimes.forEach(dateEntry => {
                const date = dateEntry.date;
                
                if (dateEntry.shows && dateEntry.shows.length > 0) {
                    dateEntry.shows.forEach(show => {
                        const roomName = show.theater;
                        const theaterName = getTheaterForRoom(roomName);
                        
                        if (theaterName) {
                            // Ensure date exists for this room
                            if (!roomView[theaterName].rooms[roomName].dates[date]) {
                                roomView[theaterName].rooms[roomName].dates[date] = {
                                    date: date,
                                    showings: []
                                };
                            }

                            // Add showing to the room's date
                            roomView[theaterName].rooms[roomName].dates[date].showings.push({
                                time: show.time,
                                movieId: movie.id,
                                movieTitle: movie.title,
                                attributes: show.attributes,
                                iframeUrl: show.iframeUrl
                            });
                        }
                    });
                }
            });
        }
    });

    // Sort showings by time within each date
    Object.values(roomView).forEach(theater => {
        Object.values(theater.rooms).forEach(room => {
            Object.values(room.dates).forEach(date => {
                date.showings.sort((a, b) => a.time.localeCompare(b.time));
            });
        });
    });

    // Convert the structure to arrays while maintaining order
    const roomViewArray = Object.entries(roomView).map(([theaterName, theater]) => ({
        name: theaterName,
        rooms: theaterStructure[theaterName].rooms
            .filter(roomName => theater.rooms[roomName]) // Only include rooms that exist in our data
            .map(roomName => ({
                name: roomName,
                dates: Object.values(theater.rooms[roomName].dates)
                    .sort((a, b) => a.date.localeCompare(b.date)) // Sort dates chronologically
            }))
    }));

    return {
        roomView: roomViewArray,
        movies: movies,
        theaters: theaterStructure
    };
}

function transformToMovieView(sourceData) {
    const movieView = {};

    // First pass: create movie entries and collect all their showtimes
    sourceData.forEach(movie => {
        movieView[movie.id] = {
            id: movie.id,
            title: movie.title,
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
            trailerUrl: movie.trailerUrl,
            actors: movie.actors,
            attributes: movie.attributes,
            dates: {}
        };

        // Process showtimes
        if (movie.showtimes) {
            movie.showtimes.forEach(dateEntry => {
                const date = dateEntry.date;
                
                if (dateEntry.shows && dateEntry.shows.length > 0) {
                    // Ensure date exists
                    if (!movieView[movie.id].dates[date]) {
                        movieView[movie.id].dates[date] = {
                            date: date,
                            theaters: {}
                        };
                    }

                    // Process each showing
                    dateEntry.shows.forEach(show => {
                        const roomName = show.theater;
                        const theaterName = getTheaterForRoom(roomName);
                        
                        if (theaterName) {
                            // Ensure theater exists for this date
                            if (!movieView[movie.id].dates[date].theaters[theaterName]) {
                                movieView[movie.id].dates[date].theaters[theaterName] = {
                                    name: theaterName,
                                    rooms: {}
                                };
                            }

                            // Ensure room exists for this theater
                            if (!movieView[movie.id].dates[date].theaters[theaterName].rooms[roomName]) {
                                movieView[movie.id].dates[date].theaters[theaterName].rooms[roomName] = {
                                    name: roomName,
                                    showings: []
                                };
                            }

                            // Add showing
                            movieView[movie.id].dates[date].theaters[theaterName].rooms[roomName].showings.push({
                                time: show.time,
                                attributes: show.attributes,
                                iframeUrl: show.iframeUrl
                            });
                        }
                    });
                }
            });
        }
    });

    // Sort and structure the data
    return Object.values(movieView).map(movie => {
        // Convert dates object to sorted array
        const sortedDates = Object.values(movie.dates).map(date => {
            // Convert theaters object to array with ordered rooms
            const sortedTheaters = Object.entries(date.theaters).map(([theaterName, theater]) => {
                // Get ordered room list from theaterStructure
                const orderedRooms = theaterStructure[theaterName].rooms
                    .filter(roomName => theater.rooms[roomName]) // Only include rooms that have showings
                    .map(roomName => {
                        const room = theater.rooms[roomName];
                        return {
                            ...room,
                            showings: room.showings.sort((a, b) => a.time.localeCompare(b.time))
                        };
                    });

                return {
                    name: theaterName,
                    rooms: orderedRooms
                };
            });

            return {
                date: date.date,
                theaters: sortedTheaters
            };
        }).sort((a, b) => a.date.localeCompare(b.date));

        return {
            ...movie,
            dates: sortedDates
        };
    });
}

function processMovieData(sourceFilePath) {
    try {
        const rawData = readFileSync(sourceFilePath, 'utf8');
        const sourceData = JSON.parse(rawData);
        const arrayData = Array.isArray(sourceData) ? sourceData : [sourceData];

        // Transform data for all views
        const dateViewData = transformToDateView(arrayData);
        const roomViewData = transformToRoomView(arrayData);
        const movieViewData = transformToMovieView(arrayData);

        // Write all views to files
        writeFileSync(
            'data/date-view.json',
            JSON.stringify(dateViewData.dateView, null, 2)
        );

        writeFileSync(
            'data/room-view.json',
            JSON.stringify(roomViewData.roomView, null, 2)
        );

        writeFileSync(
            'data/movie-view.json',
            JSON.stringify(movieViewData, null, 2)
        );

        // Write reference files
        writeFileSync(
            'data/movies-reference.json',
            JSON.stringify(dateViewData.movies, null, 2)
        );

        writeFileSync(
            'data/theaters-reference.json',
            JSON.stringify(dateViewData.theaters, null, 2)
        );

        console.log('Transformation completed successfully!');
    } catch (error) {
        console.error('Error processing movie data:', error);
        console.error('Error details:', error.message);
    }
}

// Usage
processMovieData('data/source_movie_data.json');
