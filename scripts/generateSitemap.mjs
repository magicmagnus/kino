import { promises as fs } from "fs";
import path from "path";

const baseUrl = "https://kinoschurke.de"; // Replace with your actual website URL
const moviesFilePath = path.join("src", "data", "movies-reference.json");
const eventsFilePath = path.join("src", "data", "event-view.json");
const roomsFilePath = path.join("src", "data", "room-view.json");
const datesFilePath = path.join("src", "data", "date-view.json");

async function generateSitemap() {
    const moviesData = JSON.parse(await fs.readFile(moviesFilePath, "utf8"));
    const eventsData = JSON.parse(await fs.readFile(eventsFilePath, "utf8"));
    const roomsData = JSON.parse(await fs.readFile(roomsFilePath, "utf8"));
    const datesData = JSON.parse(await fs.readFile(datesFilePath, "utf8"));

    const moviePages = Object.values(moviesData).map(
        (movie) => `/movies/${movie.slug}`,
    );
    const eventPages = eventsData.map((event) => `/events/${event.slug}`);
    const roomPages = roomsData
        .map((theater) => theater.rooms.map((room) => `/rooms/${room.slug}`))
        .flat();
    const datePages = datesData.map((date) => `/dates/${date.date}`);

    const staticPages = ["/", "/dates", "/rooms", "/movies", "/events"];

    const dynamicPages = [
        ...moviePages,
        ...eventPages,
        ...roomPages,
        ...datePages,
    ];

    const staticUrls = staticPages
        .map(
            (page) => `
    <url>
        <loc>${baseUrl}${page}</loc>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>`,
        )
        .join("");

    const dynamicUrls = dynamicPages
        .map(
            (page) => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `,
        )
        .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls}
    ${dynamicUrls}
  </urlset>`;

    const sitemapPath = path.join("public", "sitemap.xml");
    await fs.writeFile(sitemapPath, sitemap, "utf8");
    console.log(`Sitemap generated at ${sitemapPath}`);
}

generateSitemap().catch(console.error);
