import { promises as fs } from "fs";
import path from "path";

const baseUrl = "https://kinoschurke.de"; // Replace with your actual website URL
const moviesFilePath = path.join("src", "data", "movies-reference.json");

async function generateSitemap() {
    const moviesData = JSON.parse(await fs.readFile(moviesFilePath, "utf8"));
    const moviePages = Object.values(moviesData).map(
        (movie) => `/movies/${movie.slug}`,
    );

    const staticPages = [
        "/",
        "/date",
        "/room",
        // Add more static pages here
    ];

    const pages = [...staticPages, ...moviePages];

    const urls = pages
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
    ${urls}
  </urlset>`;

    const sitemapPath = path.join("public", "sitemap.xml");
    await fs.writeFile(sitemapPath, sitemap, "utf8");
    console.log(`Sitemap generated at ${sitemapPath}`);
}

generateSitemap().catch(console.error);
