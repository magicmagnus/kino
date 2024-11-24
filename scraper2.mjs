import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const fetchedPosters = {};

async function fetchPosterUrlAlt() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        defaultViewport: null,
        headless: false,
        devtools: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const kinos = ["kino-museum-tuebingen", "kino-atelier-tuebingen", "kino-blaue-bruecke-tuebingen"];
    let allMoviePosters = [];

    for (const kino of kinos) {
        console.log(`Navigating to cinema website: ${kino}`);
        await page.goto(`https://www.kinoheld.de/kino/tuebingen/${kino}/vorstellungen`, {
            waitUntil: 'networkidle0'
        });

        // Scroll to the bottom of the page to load all movies
        await autoScroll(page);

        const moviePosters = await page.evaluate(() => {
            const posters = [];
            document.querySelectorAll('.transition-opacity').forEach(element => {
                if (element.tagName.toLowerCase() === 'img') {
                    let alt = element.getAttribute('alt');
                    const src = element.getAttribute('src');
                    alt = alt.replace('Filmplakat von ', '');
                    posters.push({ alt, src });
                }
            });
            return posters;
        });

        allMoviePosters = allMoviePosters.concat(moviePosters);
    }

    console.log(allMoviePosters);

    await browser.close();

    return allMoviePosters;
}

// Function to scroll to the bottom of the page
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

fetchPosterUrlAlt();