export class KinoheldDataTransformer {
    static auditoriumMapping = {
        11115: { name: "Saal Tarantino", cinema: "Kino Blaue Brücke" },
        11117: { name: "Saal Spielberg", cinema: "Kino Blaue Brücke" },
        11119: { name: "Saal Kubrick", cinema: "Kino Blaue Brücke" },
        11121: { name: "Saal Almodóvar", cinema: "Kino Museum" },
        11123: { name: "Saal Coppola", cinema: "Kino Museum" },
        11125: { name: "Saal Arsenal", cinema: "Kino Museum" },
        11127: { name: "Atelier", cinema: "Kino Atelier" },
    };

    static cinemaLayout = {
        "Kino Blaue Brücke": {
            rooms: ["Saal Tarantino", "Saal Spielberg", "Saal Kubrick"],
        },
        "Kino Museum": {
            rooms: ["Saal Almodóvar", "Saal Coppola", "Saal Arsenal"],
        },
        "Kino Atelier": {
            rooms: ["Atelier"],
        },
    };

    static transformToDateView(apiData) {
        const { shows, movies } = apiData;
        const dateView = {};

        // Group shows by date
        shows.forEach((show) => {
            const date = show.date;
            const auditorium = this.auditoriumMapping[show.auditoriumId];

            if (!auditorium) {
                console.warn(`Unknown auditorium ID: ${show.auditoriumId}`);
                return;
            }

            // Initialize date structure
            if (!dateView[date]) {
                dateView[date] = {
                    date,
                    theaters: {},
                };
            }

            // Initialize theater structure
            if (!dateView[date].theaters[auditorium.cinema]) {
                dateView[date].theaters[auditorium.cinema] = {
                    name: auditorium.cinema,
                    rooms: {},
                };
            }

            // Initialize room structure
            if (
                !dateView[date].theaters[auditorium.cinema].rooms[
                    auditorium.name
                ]
            ) {
                dateView[date].theaters[auditorium.cinema].rooms[
                    auditorium.name
                ] = {
                    name: auditorium.name,
                    showings: [],
                };
            }

            // Add showing
            dateView[date].theaters[auditorium.cinema].rooms[
                auditorium.name
            ].showings.push({
                time: show.time,
                endTime: this.calculateEndTime(show.time, show.duration),
                movieId: show.movieId,
                movieTitle: movies[show.movieId]?.title || "Unknown",
                attributes: this.extractAttributes(show.flags),
                iframeUrl: `https://www.kinoheld.de/kino/tuebingen/kino-blaue-bruecke-tuebingen/show/${show.id}?mode=widget&showId=${show.id}`,
            });
        });

        // Convert to array and sort
        const dateViewArray = Object.values(dateView)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((dateEntry) => ({
                ...dateEntry,
                theaters: Object.values(dateEntry.theaters).map((theater) => ({
                    ...theater,
                    rooms: Object.values(theater.rooms).map((room) => ({
                        ...room,
                        showings: room.showings.sort((a, b) =>
                            a.time.localeCompare(b.time),
                        ),
                    })),
                })),
            }));

        return dateViewArray;
    }

    static transformToRoomView(apiData) {
        const { shows, movies } = apiData;
        const roomView = {};

        // Initialize the structure based on cinema layout
        Object.entries(this.cinemaLayout).forEach(([theaterName, theater]) => {
            roomView[theaterName] = {
                name: theaterName,
                rooms: theater.rooms.reduce((acc, roomName) => {
                    acc[roomName] = {
                        name: roomName,
                        slug: this.createSlug(roomName),
                        dates: {},
                    };
                    return acc;
                }, {}),
            };
        });

        // Process shows
        shows.forEach((show) => {
            const auditorium = this.auditoriumMapping[show.auditoriumId];
            if (!auditorium) {
                console.warn(`Unknown auditorium ID: ${show.auditoriumId}`);
                return;
            }

            const theaterName = auditorium.cinema;
            const roomName = auditorium.name;
            const date = show.date;

            // Ensure date exists for this room
            if (!roomView[theaterName].rooms[roomName].dates[date]) {
                roomView[theaterName].rooms[roomName].dates[date] = {
                    date: date,
                    showings: [],
                };
            }

            // Add showing to the room's date
            roomView[theaterName].rooms[roomName].dates[date].showings.push({
                time: show.time,
                endTime: this.calculateEndTime(show.time, show.duration),
                movieId: show.movieId,
                movieTitle: movies[show.movieId]?.title || "Unknown",
                attributes: this.extractAttributes(show.flags),
                iframeUrl: `https://www.kinoheld.de/kino/tuebingen/kino-blaue-bruecke-tuebingen/show/${show.id}?mode=widget&showId=${show.id}`,
            });
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
                rooms: this.cinemaLayout[theaterName].rooms
                    .filter((roomName) => theater.rooms[roomName]) // Only include rooms that exist in our data
                    .map((roomName) => ({
                        name: roomName,
                        slug: theater.rooms[roomName].slug,
                        dates: Object.values(
                            theater.rooms[roomName].dates,
                        ).sort((a, b) => a.date.localeCompare(b.date)),
                    })),
            }),
        );

        return roomViewArray;
    }

    static transformToMovieView(apiData) {
        const { shows, movies } = apiData;
        const movieView = {};

        // Initialize movie structure
        Object.entries(movies).forEach(([movieId, movie]) => {
            movieView[movieId] = {
                id: parseInt(movieId),
                title: movie.title || movie.name || "Unknown Title",
                slug: this.createSlug(movie.title || movie.name),
                duration: movie.duration ? `${movie.duration} min` : "Unknown",
                fsk: movie.ageClassificationRating?.value || "Unknown",
                genre:
                    movie.genres?.map((g) => g.name).join(", ") ||
                    "Unknown Genre",
                originalTitle: movie.title_orig || "Unknown Original Title",
                production:
                    movie.productionCountries?.join(", ") ||
                    "Unknown Production",
                releaseDate: this.formatReleaseDate(movie.released),
                distributor: movie.distributor || "Unknown Distributor",
                director: movie.directors?.[0]?.name || "Unknown Director",
                description: this.cleanDescription(
                    movie.description ||
                        movie.additional_description ||
                        "No description available",
                ),
                posterUrl:
                    movie.largeImage || movie.lazyImage || "Unknown Poster URL",
                trailerUrl: this.extractTrailerUrl(movie.trailers),
                actors: movie.actors?.map((actor) => actor.name) || [],
                attributes: movie.attributes || [],
                dates: {},
            };
        });

        // Process shows and group by movie
        shows.forEach((show) => {
            const auditorium = this.auditoriumMapping[show.auditoriumId];
            if (!auditorium) {
                console.warn(`Unknown auditorium ID: ${show.auditoriumId}`);
                return;
            }

            const movieId = show.movieId;
            const date = show.date;
            const theaterName = auditorium.cinema;
            const roomName = auditorium.name;

            if (!movieView[movieId]) {
                console.warn(`Movie not found: ${movieId}`);
                return;
            }

            // Ensure date exists
            if (!movieView[movieId].dates[date]) {
                movieView[movieId].dates[date] = {
                    date: date,
                    theaters: {},
                };
            }

            // Ensure theater exists for this date
            if (!movieView[movieId].dates[date].theaters[theaterName]) {
                movieView[movieId].dates[date].theaters[theaterName] = {
                    name: theaterName,
                    rooms: {},
                };
            }

            // Ensure room exists for this theater
            if (
                !movieView[movieId].dates[date].theaters[theaterName].rooms[
                    roomName
                ]
            ) {
                movieView[movieId].dates[date].theaters[theaterName].rooms[
                    roomName
                ] = {
                    name: roomName,
                    showings: [],
                };
            }

            // Add showing
            movieView[movieId].dates[date].theaters[theaterName].rooms[
                roomName
            ].showings.push({
                time: show.time,
                endTime: this.calculateEndTime(show.time, show.duration),
                movieId: show.movieId,
                attributes: this.extractAttributes(show.flags),
                iframeUrl: `https://www.kinoheld.de/kino/tuebingen/kino-blaue-bruecke-tuebingen/show/${show.id}?mode=widget&showId=${show.id}`,
            });
        });

        // Sort and structure the data
        const movieViewArray = Object.values(movieView).map((movie) => {
            // Convert dates object to sorted array
            const sortedDates = Object.values(movie.dates)
                .map((date) => {
                    // Convert theaters object to array with ordered rooms
                    const sortedTheaters = Object.entries(date.theaters).map(
                        ([theaterName, theater]) => {
                            // Get ordered room list from cinema layout
                            const orderedRooms = this.cinemaLayout[
                                theaterName
                            ].rooms
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

        return movieViewArray;
    }

    static transformToEventView(apiData) {
        const { shows, movies } = apiData;
        const eventMap = new Map();

        // Process shows and collect events
        shows.forEach((show) => {
            const auditorium = this.auditoriumMapping[show.auditoriumId];
            if (!auditorium) {
                console.warn(`Unknown auditorium ID: ${show.auditoriumId}`);
                return;
            }

            const attributes = this.extractAttributes(show.flags);
            const events = this.getFilteredEvents(attributes);

            events.forEach((event) => {
                const eventSlug = this.createSlug(event);

                if (!eventMap.has(eventSlug)) {
                    eventMap.set(eventSlug, {
                        slug: eventSlug,
                        name: event,
                        dates: new Map(),
                    });
                }

                const eventData = eventMap.get(eventSlug);
                const dateKey = show.date;

                if (!eventData.dates.has(dateKey)) {
                    eventData.dates.set(dateKey, {
                        date: dateKey,
                        theaters: new Map(),
                    });
                }

                const dateData = eventData.dates.get(dateKey);
                const theaterKey = auditorium.cinema;

                if (!dateData.theaters.has(theaterKey)) {
                    dateData.theaters.set(theaterKey, {
                        name: auditorium.cinema,
                        rooms: new Map(),
                    });
                }

                const theaterData = dateData.theaters.get(theaterKey);
                const roomKey = auditorium.name;

                if (!theaterData.rooms.has(roomKey)) {
                    theaterData.rooms.set(roomKey, {
                        name: auditorium.name,
                        showings: [],
                    });
                }

                theaterData.rooms.get(roomKey).showings.push({
                    time: show.time,
                    endTime: this.calculateEndTime(show.time, show.duration),
                    movieId: show.movieId,
                    movieTitle: movies[show.movieId]?.title || "Unknown",
                    attributes: attributes,
                    iframeUrl: `https://www.kinoheld.de/kino/tuebingen/kino-blaue-bruecke-tuebingen/show/${show.id}?mode=widget&showId=${show.id}`,
                });
            });
        });

        // Convert Maps to Arrays and sort
        const eventViewData = Array.from(eventMap.values()).map((event) => ({
            ...event,
            dates: Array.from(event.dates.values())
                .map((date) => ({
                    ...date,
                    theaters: Array.from(date.theaters.values()).map(
                        (theater) => ({
                            ...theater,
                            rooms: Array.from(theater.rooms.values()).map(
                                (room) => ({
                                    ...room,
                                    showings: room.showings.sort((a, b) =>
                                        a.time.localeCompare(b.time),
                                    ),
                                }),
                            ),
                        }),
                    ),
                }))
                .sort((a, b) => a.date.localeCompare(b.date)),
        }));

        // Sort events alphabetically by name
        return eventViewData.sort((a, b) => a.name.localeCompare(b.name));
    }

    static createShowLookup(apiData) {
        const { shows, movies } = apiData;
        const showLookup = {};

        shows.forEach((show) => {
            const auditorium = this.auditoriumMapping[show.auditoriumId];
            if (!auditorium) {
                console.warn(`Unknown auditorium ID: ${show.auditoriumId}`);
                return;
            }

            // Create the same hash format as in MovieBlock
            const showId = show.id;
            const hash = `${showId}-${show.time.split(":").join("-")}`;

            const movie = movies[show.movieId];
            if (!movie) {
                console.warn(`Movie not found: ${show.movieId}`);
                return;
            }

            showLookup[hash] = {
                show: {
                    time: show.time,
                    endTime: this.calculateEndTime(show.time, show.duration),
                    movieId: show.movieId,
                    movieTitle: movie.title || movie.name || "Unknown",
                    attributes: this.extractAttributes(show.flags),
                    iframeUrl: `https://www.kinoheld.de/kino/tuebingen/kino-blaue-bruecke-tuebingen/show/${show.id}?mode=widget&showId=${show.id}`,
                    theater: auditorium.name,
                },
                movieInfo: {
                    id: parseInt(show.movieId),
                    title: movie.title || movie.name || "Unknown Title",
                    slug: this.createSlug(movie.title || movie.name),
                    duration: movie.duration
                        ? `${movie.duration} min`
                        : "Unknown",
                    fsk: movie.ageClassificationRating?.value || "Unknown",
                    genre:
                        movie.genres?.map((g) => g.name).join(", ") ||
                        "Unknown Genre",
                    originalTitle: movie.title_orig || "Unknown Original Title",
                    production:
                        movie.productionCountries?.join(", ") ||
                        "Unknown Production",
                    releaseDate: this.formatReleaseDate(movie.released),
                    distributor: movie.distributor || "Unknown Distributor",
                    director: movie.directors?.[0]?.name || "Unknown Director",
                    description: this.cleanDescription(
                        movie.description ||
                            movie.additional_description ||
                            "No description available",
                    ),
                    posterUrl:
                        movie.largeImage ||
                        movie.lazyImage ||
                        "Unknown Poster URL",
                    trailerUrl: this.extractTrailerUrl(movie.trailers),
                    actors: movie.actors?.map((actor) => actor.name) || [],
                },
                date: show.date,
            };
        });

        return showLookup;
    }

    static transformMoviesReference(apiData) {
        const { movies } = apiData;
        const moviesReference = {};

        Object.entries(movies).forEach(([movieId, movie]) => {
            // Create slug from title
            const slug = this.createSlug(movie.title);

            // Extract FSK rating
            const fsk = movie.ageClassificationRating?.value || "Unknown";

            // Extract duration (convert minutes to "X min" format)
            const duration = movie.duration
                ? `${movie.duration} min`
                : "Unknown";

            // Extract genres
            const genre =
                movie.genres?.map((g) => g.name).join(", ") || "Unknown Genre";

            // Extract production countries
            const production =
                movie.productionCountries?.join(", ") || "Unknown Production";

            // Format release date
            const releaseDate = this.formatReleaseDate(movie.released);

            // Extract director
            const director = movie.directors?.[0]?.name || "Unknown Director";

            // Extract actors
            const actors = movie.actors?.map((actor) => actor.name) || [];

            // Get poster URL
            const posterUrl =
                movie.largeImage || movie.lazyImage || "Unknown Poster URL";

            // Get trailer URL (extract YouTube ID)
            const trailerUrl = this.extractTrailerUrl(movie.trailers);

            // Extract distributor
            const distributor = movie.distributor || "Unknown Distributor";

            moviesReference[movieId] = {
                id: parseInt(movieId),
                title: movie.title || movie.name || "Unknown Title",
                slug: slug,
                duration: duration,
                fsk: fsk,
                genre: genre,
                originalTitle: movie.title_orig || "Unknown Original Title",
                production: production,
                releaseDate: releaseDate,
                distributor: distributor,
                director: director,
                description: this.cleanDescription(
                    movie.description ||
                        movie.additional_description ||
                        "No description available",
                ),
                posterUrl: posterUrl,
                trailerUrl: trailerUrl,
                actors: actors,
                attributes: this.getUniqueAttributes(apiData, movieId),
            };
        });

        return moviesReference;
    }

    // Helper methods
    static getFilteredEvents(attributes) {
        const eventBlacklist = ["2D", "3D", "Dolby Atmos", "IMAX"];

        return attributes
            .filter((attr) => !eventBlacklist.includes(attr))
            .filter((attr) => attr.trim().length > 0);
    }

    static createSlug(title) {
        if (!title) return "unknown-title";

        return title
            .toLowerCase()
            .replace(/[äöüß]/g, (match) => {
                const replacements = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
                return replacements[match] || match;
            })
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim("-");
    }

    static formatReleaseDate(dateString) {
        if (!dateString) return "Unknown Release Date";

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (error) {
            return "Unknown Release Date";
        }
    }

    static extractTrailerUrl(trailers) {
        if (!trailers || !Array.isArray(trailers) || trailers.length === 0) {
            return "aFXjl4AA1hA"; // Default placeholder
        }

        const trailer = trailers[0];
        if (trailer.format === "youtube" && trailer.id) {
            return trailer.id;
        }

        return "aFXjl4AA1hA"; // Default placeholder
    }

    static cleanDescription(description) {
        if (!description) return "No description available";

        // Remove HTML tags and clean up the description
        return description
            .replace(/<br><br>/g, "\n\n")
            .replace(/<br>/g, "\n")
            .replace(/<[^>]*>/g, "")
            .trim();
    }

    static getUniqueAttributes(apiData, movieId) {
        const { shows } = apiData;
        const attributeSet = new Set();

        // Find all shows for this movie and collect unique attributes
        shows
            .filter((show) => show.movieId === movieId)
            .forEach((show) => {
                const attributes = this.extractAttributes(show.flags);
                attributes.forEach((attr) => attributeSet.add(attr));
            });

        return Array.from(attributeSet);
    }

    static calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;
        const endHours = Math.floor(endMinutes / 60) % 24;
        const endMins = endMinutes % 60;
        return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
    }

    static extractAttributes(flags) {
        if (!flags || !Array.isArray(flags)) return ["2D"];

        const attributes = flags.map((flag) => {
            switch (flag.code) {
                case "3d":
                    return "3D";
                case "omdu":
                    return "OmdU";
                case "omu":
                    return "OmU";
                case "omeu":
                    return "OmeU";
                case "ov":
                    return "OV";
                case "atmos":
                    return "Dolby Atmos";
                default:
                    return flag.name || flag.code;
            }
        });

        return attributes.length > 0 ? attributes : ["2D"];
    }
}
