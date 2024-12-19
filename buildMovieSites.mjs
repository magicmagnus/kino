// dataUpdateScript.js

import fs from "fs";
import path from "path";
import slugify from "slugify";

const MOVIE_DATA = [];

// Function to fetch and load movie data from JSON file movie_data.json
function loadMovieData() {
    const movieData = JSON.parse(fs.readFileSync("movie_data.json", "utf-8"));

    // Add movie data to MOVIE_DATA array
    MOVIE_DATA.push(...movieData);
}

// Load movie data
loadMovieData();

const __dirname = path
    .dirname(new URL(import.meta.url).pathname)
    .replace(/^\/([a-zA-Z]):/, "$1:");

const templateContent = fs.readFileSync("movieTemplate.html", "utf-8");



MOVIE_DATA.forEach((movie) => {
    // Sanitize movie title for URL
    const sanitizedTitle = slugify(movie.title, {
        lower: true,
        strict: true,
        locale: 'de',
    });
    movie.slug = sanitizedTitle;
    
    const movieDir = path.join(__dirname, "movies");
    const movieFilePath = path.join(movieDir, `${sanitizedTitle}.html`);

    // Create movies directory if it doesn't exist
    if (!fs.existsSync(movieDir)) {
        fs.mkdirSync(movieDir);
    }

    // Generate the movie page content
    const moviePageContent = templateContent.replace("{{movieTitle}}", movie.title).replace("{{movieDescription}}", movie.description);

    // Write the movie page to an HTML file
    fs.writeFileSync(movieFilePath, moviePageContent);
});

function generateTimelines(showtimes) {
    return showtimes
        .map((showtime) => {
            return `<div class="showtime">
        <div class="showtime__start">${showtime}</div>
        </div>`;
        })
        .join("");
}

console.log("Movie pages generated successfully!");

// save the updated movie data
fs.writeFileSync("movie_data.json", JSON.stringify(MOVIE_DATA, null, 2));
