export const HOUR_WIDTH = 112; // 7rem = 112px = w-28 until breakpoint lg
export const HOUR_WIDTH_LARGE = 128; // 8rem = 128px = w-32 from breakpoint lg
export const HOUR_WIDTH_XL = 144; // 9rem = 144px = w-36 from breakpoint 2xl
export const START_HOUR = 9; // 9 AM
export const END_HOUR = 25; // 1 AM next day
export const TOTAL_HOURS = END_HOUR - START_HOUR + 1; // 17 hours
export const TIMELINE_WIDTH = TOTAL_HOURS * HOUR_WIDTH;
// export today as YYYY-MM-DD
export const TODAY_FORMATTED = new Date().toISOString().split("T")[0];

// Generate hours for the timeline (9 AM to 1 AM next day)
export const HOURS = Array.from({ length: 17 }, (_, i) => {
    const hour = (i + START_HOUR) % 24;
    return `${hour.toString().padStart(2, "0")}:00`;
});

export const timeToPixels = (time, hourWidth = HOUR_WIDTH) => {
    const [hours, minutes] = time.split(":").map(Number);
    const hoursFromStart =
        hours >= START_HOUR ? hours - START_HOUR : hours + 24 - START_HOUR;
    return (hoursFromStart * 60 + minutes) * (hourWidth / 60);
};

export const isDateTodayOrTomorrow = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return (
        date === TODAY_FORMATTED ||
        date === tomorrow.toISOString().split("T")[0]
    );
};

export const formatDateString = (
    date,
    addNumbersToToday = false,
    weekdayFormat = "short",
) => {
    let dateObj = new Date(date);
    let today = new Date();
    let tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let formattedDate = dateObj.toLocaleDateString("de-DE", {
        month: "numeric",
        day: "numeric",
    });

    if (date === TODAY_FORMATTED) {
        return addNumbersToToday ? `Heute, ${formattedDate}` : "Heute";
    } else if (
        dateObj.getDate() === tomorrow.getDate() &&
        dateObj.getMonth() === tomorrow.getMonth() &&
        dateObj.getFullYear() === tomorrow.getFullYear()
    ) {
        return addNumbersToToday ? `Morgen, ${formattedDate}` : "Morgen";
    }

    return dateObj.toLocaleDateString("de-DE", {
        weekday: weekdayFormat,
        month: "numeric",
        day: "numeric",
    });
};

export const containsOmdu = (attributes) => {
    return attributes.includes("OmdU") || attributes.includes("OmU")
        ? "OmdU"
        : attributes.includes("OmeU")
          ? "OmeU"
          : attributes.includes("OV")
            ? "OV"
            : null;
};

export const getOtherAttribute = (attributes) => {
    // return the first attribute that is not a 'technical' attribute
    return attributes.filter(
        (attribute) =>
            attribute !== "2D" &&
            attribute !== "Dolby Atmos" &&
            attribute !== "OmdU" &&
            attribute !== "OmeU" &&
            attribute !== "OmU" &&
            attribute !== "OV",
    )[0];
};

export const getMovieIMDBID = async (movieTitle) => {
    const options = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization:
                "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNjE1NzhlM2FhMzZkYzcyMmU0YjUzNTg4ZDg2MmEyZCIsIm5iZiI6MTczODE4MjE1NC4xNDIwMDAyLCJzdWIiOiI2NzlhOGUwYTQ0NDhkYTNkMmFiZDZiOTYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.K80Jolgl8n4_PGAsJh-K07b4ZnhfzSXVEGcY2wOcqkg",
        },
    };

    try {
        // Search for the movie
        const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
                movieTitle,
            )}&include_adult=false&language=en-US&page=1`,
            options,
        );
        const searchData = await searchResponse.json();

        // Return null if no results
        if (!searchData.results || searchData.results.length === 0) {
            return null;
        }

        const tmdbId = searchData.results[0].id;

        // Fetch the IMDB ID using the TMDB movie ID
        const movieResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${tmdbId}?append_to_response=external_ids`,
            options,
        );
        const movieData = await movieResponse.json();

        return movieData.imdb_id || null;
    } catch (err) {
        console.error("TMDB fetch error:", err);
        return null;
    }
};
