import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import stringSimilarity from 'string-similarity';

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
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // args: ['--start-maximized'],

  });
  const page = await browser.newPage();
  
  let allMovieInfos = [];
  const kinos = ["kino-museum-tuebingen", "kino-atelier-tuebingen", "kino-blaue-bruecke-tuebingen"];
  
  // 1. first scrape all movie infos except the dates/shotwimes from one page
  console.log('1. Scraping movie infos from "widget pages"...');
  for (const kino of kinos) {
    console.log(`Navigating to cinema website: ${kino}`);
    await page.goto(`https://www.kinoheld.de/kino/tuebingen/${kino}/shows/movies?mode=widget`, {
      waitUntil: 'networkidle0'
    });

    // Click all "Info" buttons and wait for possible updates
    await autoScroll(page);
    await page.evaluate( () => {
      const buttons = document.querySelectorAll('.movie__actions');
      for (const button of buttons) {
        const button1 = button.children[0];
        button1.click();
      }
      return new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    const movieInfos = await page.evaluate(async () => {
      const movies = [];
      await new Promise(resolve => setTimeout(resolve, 500));
      const movieItems = document.querySelectorAll('.movie');
      for (const movieItem of movieItems) {
        
        const description = movieItem.querySelector('.movie__info-description')?.textContent.trim() || 'Unknown Description';
        const posterUrl = movieItem.querySelector('.movie__image img')?.src || null;
        
        // some infos are nested in the short and long info sections
        const movieInfoShort = movieItem.querySelector('.movie__info--short');
        let duration = '0';
        let fsk = 'Unknown FSK';
        let genre = 'Unknown Genre';
        for (let i = 0; i < movieInfoShort.querySelectorAll('dt').length; i++) {
          const dt = movieInfoShort.querySelectorAll('dt')[i];
          const dd = movieInfoShort.querySelectorAll('dd')[i];
          if (dt.textContent.trim() === "Dauer") {
            duration = dd.textContent.trim();
          }
          if (dt.textContent.trim() === "FSK") {
            fsk = dd.textContent.trim();
          }
          if (dt.textContent.trim() === "Genre") {
            genre = dd.textContent.trim();
          }
      
        }
        
        const movieInfoLong = movieItem.querySelector('.movie__info--long');
        let title = 'Unknown Title';
        let origTitle = 'Unknown Original Title';
        let production = 'Unknown Production';
        let releaseDate = 'Unknown Release Date';
        let distributor = 'Unknown Distributor';
        let director = 'Unknown Director';
        let actors = [];

        for (let i = 0; i < movieInfoLong.querySelectorAll('dt').length; i++) {
          const dt = movieInfoLong.querySelectorAll('dt')[i].textContent.trim();
          const dd = movieInfoLong.querySelectorAll('dd')[i];
          const ddText = dd.textContent.trim();
          switch (dt) {
            case "Titel":
              title = ddText;
              break;
            case "Originaltitel":
              origTitle = ddText;
              break;
            case "Produktion":
              production = ddText.split('\n')[0].trim();
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
              actors = Array.from(dd.querySelectorAll('span')).map(span => span.textContent.trim());
              break;
          }
        }

        // click on the trailer button to get the trailer URL
        const trailerButton = movieItem.querySelector('.movie__actions')?.children[1];
        let trailerUrl = "Unknown Trailer URL";
        if (trailerButton) {
          trailerButton.click();
          await new Promise(resolve => setTimeout(resolve, 500)); // wait for the trailer iframe to appear
          const iframe = movieItem.querySelector('iframe');
          if (iframe) {
            trailerUrl = iframe.src;
          }
          trailerButton.click(); // close the trailer iframe
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
        });
      }

      return movies;
    });

    allMovieInfos = allMovieInfos.concat(movieInfos);
  }

  console.log('Found', allMovieInfos.length, 'movies from "widget pages"');
  console.log('allMovieInfos', allMovieInfos);


  // 2. Scrape the dates, showtimes and iframe URL from the other cinema website
  console.log('2. Scraping movie dates, showtimes and iframe URLs from "programmübersicht"...');
  await page.goto('https://tuebinger-kinos.de/programmuebersicht/', {
    waitUntil: 'networkidle0'
  });

  //Click all "more dates" buttons and wait for possible updates
  await page.evaluate(() => {
    const closeButton = document.querySelector('.brlbs-cmpnt-close-button');
    if (closeButton) {
        closeButton.click();
    }
    return new Promise((resolve) => {
        //sometimes the expand button does not open all the dates so click on an extras button with class "performance-item-date"
        const buttons1 = document.querySelectorAll('.performance-item-date');
        const buttons2 = document.querySelectorAll('.performance-item-dates');
        const buttons3 = document.querySelectorAll('.performance-item-more-dates');
        buttons1.forEach(button => button.click());
        buttons2.forEach(button => button.click());
        buttons3.forEach(button => button.click());
        setTimeout(resolve, 1000); // Wait 1 second after clicking all buttons
    });
  });

  
  let allMovieDates = await page.evaluate(async () => {

    function formatAttributes(attributes) {
      return attributes.map(attr => {
        if (attr.toLowerCase().includes('omd')) {
          return 'OmdU';
        } else if (attr.toLowerCase().includes('ome')) {
          return 'OmeU';
        }
        return attr;
      });
    }

    const movies = [];
    const movieItems = document.querySelectorAll('.movie-item');

    for (const movieItem of movieItems) {
      
      const title = movieItem.querySelector('.title')?.textContent.trim() || 'Unknown Title';
      const attributes = formatAttributes(Array.from(movieItem.querySelectorAll('.attribute')).map(attr => attr.textContent.trim()));
      
      // movie-times-grids are the containers for Dates, Theater1, Theater2, ...
      let timeGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'));
      if (timeGrids.length === 0) {
        movieItem.querySelector('.buy-ticket-button').click();
        timeGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'));
        console.log('No time grids found, clicked on buy ticket button');
      }

      // First grid contains the dates
      const dateGrid = timeGrids[0];
      const dates = Array.from(dateGrid.querySelectorAll('.date')).map(dateElement => {
        let date = dateElement.textContent.trim();
        if (date === 'Heute') {
          const today = new Date();
          date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        } else {
          const [, day, month] = date.match(/(\d+)\.(\d+)\.$/) || [];
          if (day && month) {
            const year = new Date().getFullYear();
            date = `${year}-${month}-${day}`;
          }
        }
        return date;
      });

      const showtimes = [];
      
      // for each movie, loop through all dates
      for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
        const date = dates[dateIndex];
        const shows = [];
        
        // for each date, loop through all timeGrids (all theaters), from index 1 to skip the dateGrid
        for (let gridIndex = 1; gridIndex < timeGrids.length; gridIndex++) {
          const performanceWrappers = timeGrids[gridIndex].querySelectorAll('.performances-wrapper');
          // Get the performance wrapper for this date index
          const performanceWrapper = performanceWrappers[dateIndex];
          if (!performanceWrapper) {
            continue;
          }
          // for each performance wrapper (which is all shows for a day), loop through all showtimes
          const showWrappers = performanceWrapper.querySelectorAll('.show-wrapper');
          for (let showIndex = 0; showIndex < showWrappers.length; showIndex++) {
            const show = showWrappers[showIndex];
            show.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            shows.push({
              time: show.querySelector('.showtime')?.textContent.trim() || 'Unknown Time',
              theater: show.querySelector('.theatre-name')?.textContent.trim() || 'Unknown Theater',
              attributes : formatAttributes(Array.from(show.querySelectorAll('.attribute-logo')).map(attr => {
                let attribute = attr.querySelector('.screen-reader-text')?.textContent.trim() ||
                attr.dataset.attribute ||
                'Unknown Attribute';
                return attribute;
              })),

              iframeUrl: document.querySelector('iframe')?.src || 'Unknown iframe URL'
            });
          }
        }
        showtimes.push({
          date,
          shows
        });
      }
      movies.push({
        title,
        attributes,
        showtimes
      });
    }
    return movies;
  });

  console.log('Found', allMovieDates.length, 'movies from "programmübersicht"');
  console.log('allMovieDates', allMovieDates);


  // 3. merge the two lists
  console.log('3. Merging movie infos with dates...');

  // Set a similarity threshold (e.g., 0.7 for 70% similarity)
  const SIMILARITY_THRESHOLD = 0.7;

  // Function to find the closest match for a given title
  function findClosestMatch(title, allMovieInfos) {
    const titles = allMovieInfos.map(info => info.title);

    const bestMatch = stringSimilarity.findBestMatch(title, titles);
    if (bestMatch.bestMatch.rating >= SIMILARITY_THRESHOLD) {
      return bestMatch.bestMatch.target;
    } else {
      return null;
    }
  }

  // Merge all properties of the same movie title from the two lists into one list
  const movies = allMovieDates.map(date => {
    const closestTitle = findClosestMatch(date.title, allMovieInfos);
    if (closestTitle) {
      const movieInfo = allMovieInfos.find(info => info.title === closestTitle);
      return { ...date, ...movieInfo };
    } else {
      return date; // Keep the original entry if no close match is found
    }
  });

  console.log('Merged', movies.length, 'movies with dates and showtimes');
  console.log('movies', movies);
  

  // 4. scrape higher resolution poster URLs
  console.log('4. Scraping higher resolution poster URLs from "non-widget pages"...');
  async function scrapePosterUrls() {
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true, 
        devtools: false,
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
                    let src = element.getAttribute('src');
                    alt = alt.replace('Filmplakat von ', '');
                    posters.push({ 
                      alt, 
                      src 
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

  const moviePosters = await scrapePosterUrls();
  console.log('Found', moviePosters.length, 'movie posters from "non-widget pages"');
  for (const movie of movies) {
    const poster = moviePosters.find(poster => poster.alt.toLowerCase().includes(movie.title.toLowerCase()));
    if (poster) {
      movie.posterUrl = poster.src; 
    }
  }
  await browser.close();

  console.log('Merged', movies.length, 'movies with higher resolution poster URLs');

  console.log('\nSaving data to file...');
  await fs.writeFile('movie_data.json', JSON.stringify(movies, null, 2));
  console.log('Data has been scraped and saved to movie_data.json');

}

      
// Run the main function
scrapeCinema().catch(error => {
  console.error('Error in scraping:', error);
  process.exit(1);
});
