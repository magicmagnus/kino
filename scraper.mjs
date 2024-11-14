import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { debug } from 'console';
import stringSimilarity from 'string-similarity';

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const fetchedPosters = {};

async function fetchPosterUrl(title) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
    );
    const json = await response.json();
    
    if (json.results && json.results.length > 0 && json.results[0].poster_path) {
      const posterUrl = `https://image.tmdb.org/t/p/w500${json.results[0].poster_path}`;
      fetchedPosters[title] = posterUrl;
      return posterUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching poster for ${title}:`, error);
    return null;
  }
}

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




async function scrapeCinema() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    //headless: false,  // Set to false to see what's happening
    // args: ['--start-maximized'],
    defaultViewport: { width: 1920, height: 1080 },
    headless: true, // Set to true for headless mode , or 'new'
    devtools: false,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']

  });
  const page = await browser.newPage();

  const kinos = ["kino-museum-tuebingen", "kino-atelier-tuebingen", "kino-blaue-bruecke-tuebingen"];
  
  // 1. first scrape all movie infos except the dates/shotwimes from one page
  console.log('1. Scraping movie infos...');
  let allMovieInfos = [];
  for (const kino of kinos) {
    console.log(`Navigating to cinema website: ${kino}`);
    await page.goto(`https://www.kinoheld.de/kino/tuebingen/${kino}/shows/movies?mode=widget`, {
      waitUntil: 'networkidle0'
    });

    // Click all "more dates" buttons and wait for possible updates
    console.log('Expanding all movie dates...');
    await autoScroll(page);
  

    await page.evaluate( () => {
      // debugger;
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
        
        // debugger;
        // const title = movieItem.querySelector('.movie__title')?.textContent.trim() || 'Unknown Title';
        const description = movieItem.querySelector('.movie__info-description')?.textContent.trim() || 'Unknown Description';
        const posterUrl = movieItem.querySelector('.movie__image img')?.src || null;
        
        // some infos are nested in the short and long info sections
        const movieInfoShort = movieItem.querySelector('.movie__info--short');
        const duration = movieInfoShort.querySelectorAll('dd')[0]?.textContent.trim() || 'Unknown Duration';
        const fsk = movieInfoShort.querySelectorAll('dd')[1]?.textContent.trim() || 'Unknown FSK';
        const genre = movieInfoShort.querySelectorAll('dd')[2]?.textContent.trim() || 'Unknown Genre';

        const movieInfoLong = movieItem.querySelector('.movie__info--long');
        const title = movieInfoLong.querySelectorAll('dd')[0]?.textContent.trim() || 'Unknown Title';
        // only some movies have an original title, then indices after are shifted by 1
        let i = 1;
        let originalTitle = 'Unknown Original Title';
        const isOriginal = movieInfoLong.querySelectorAll('dt')[1]?.textContent.trim() || 'Unknown Original Title';
        if (isOriginal == "Originaltitel") {
          originalTitle = movieInfoLong.querySelectorAll('dd')[1]?.textContent.trim() || 'Unknown Original Title';
          i = 2;
        }
        const production = movieInfoLong.querySelectorAll('dd')[i+0]?.textContent.trim().split('\n')[0].trim() || 'Unknown Production';
        const releaseDate = movieInfoLong.querySelectorAll('dd')[i+1]?.textContent.trim() || 'Unknown Release Date';
        const distributor = movieInfoLong.querySelectorAll('dd')[i+2]?.textContent.trim() || 'Unknown Distributor';
        const director = movieInfoLong.querySelectorAll('dd')[i+3]?.textContent.trim() || 'Unknown Director';
        const actors = Array.from(movieInfoLong.querySelectorAll('dd')[i+4]?.querySelectorAll('span') || []).map(span => span.textContent.trim());

        // clikc ono the trailer button to get the trailer URL
        const trailerButton = movieItem.querySelector('.movie__actions')?.children[1];
        let trailerUrl = "Unknown Trailer URL";
        if (trailerButton) {
          trailerButton.click();
          await new Promise(resolve => setTimeout(resolve, 500)); // wait for the trailer iframe to appear
          const iframe = movieItem.querySelector('iframe');
          if (iframe) {
            trailerUrl = iframe.src;
          }
          // close the trailer
          trailerButton.click();
        } 

        // let showtimes = [];
        // const showtimeWrappers = movieItem.querySelector('.playTimes__slider-slides');
        
        // const dates = showtimeWrappers.children[0];
        // for (let dayIndex; dayIndex < dates.children.length; dayIndex++) {
        //   const date = dates.children[dayIndex].textContent.trim();

          
        //   for (let showtimeIndex = 0; showtimeIndex < showtimeWrappers.length - 1; showtimeIndex++) {
        //     const showtime = showtimeWrappers.children[showtimeIndex];
        //     if (showtime.classList.contains('is-disabled')) {
        //       continue;
        //     }
        //     const time = showtime.querySelector('.show-detail-button__label--time').textContent.trim();
        //     const theater = showtime.querySelector('.playTimes__theater').textContent.trim();
        //     showtimes.push({
        //       date,
        //       time,
        //       theater
        //     });
        //   }
        // }
      
        // add the movie to the list
        movies.push({
          title,
          duration,
          fsk,
          genre,
          origTitle: originalTitle,
          production,
          releaseDate,
          distributor,
          director,
          actors,
          description,
          posterUrl,
          trailerUrl
        });
      }

      return movies;
    });

    allMovieInfos = allMovieInfos.concat(movieInfos);
  }

  console.log('Found', allMovieInfos.length, 'movies');

  // 2. Scrape the dates, showtimes and iframe URL from the other cinema website
  console.log('2. Scraping movie dates, showtimes and iframe URLs...');
  await page.goto('https://tuebinger-kinos.de/programmuebersicht/', {
    waitUntil: 'networkidle0'
  });

  //Click all "more dates" buttons and wait for possible updates
  console.log('Expanding all movie dates...');
  await page.evaluate(() => {
    const closeButton = document.querySelector('.brlbs-cmpnt-close-button');
    if (closeButton) {
        closeButton.click();
    }
    return new Promise((resolve) => {
        //sometimes the expand button does not open all the dates so click on an extras button with class "performance-item-date"
        const buttons1 = document.querySelectorAll('.performance-item-date');
        buttons1.forEach(button => button.click());
        const buttons2 = document.querySelectorAll('.performance-item-more-dates');
        buttons2.forEach(button => button.click());
        const buttons3 = document.querySelectorAll('.performance-item-dates');
        buttons3.forEach(button => button.click());
        setTimeout(resolve, 1000); // Wait 1 second after clicking all buttons
    });
  });

  console.log('Scraping movie data...');
  let allMovieDates = await page.evaluate(async () => {

    const movies = [];
    await new Promise(resolve => setTimeout(resolve, 500));
    const movieItems = document.querySelectorAll('.movie-item');

    for (const movieItem of movieItems) {
      const title = movieItem.querySelector('.title')?.textContent.trim() || 'Unknown Title';
      
      // Basic movie info
      const genre = movieItem.querySelector('.genres')?.textContent.trim() || 'Unknown Genre';
      const duration = movieItem.querySelector('.length')?.textContent.trim() || 'Unknown Duration';
      const fsk = movieItem.querySelector('.fsk')?.textContent.trim() || 'Unknown FSK';
      const description = movieItem.querySelector('.description')?.textContent.trim() || 'No description available';
      const attributes = Array.from(movieItem.querySelectorAll('.attribute')).map(attr => attr.textContent.trim());
        
      // Get all movie-times-grids
      let timeGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'));
      
      if (timeGrids.length === 0) {
        movieItem.querySelector('.buy-ticket-button').click();
        timeGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'));
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
      
      // Loop through all dates
      for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
        const date = dates[dateIndex];
        const shows = [];
        
        // Start from index 1 to skip the date grid
        for (let gridIndex = 1; gridIndex < timeGrids.length; gridIndex++) {
          const theaterGrid = timeGrids[gridIndex];
          const performanceWrappers = theaterGrid.querySelectorAll('.performances-wrapper');
          
          // Get the performance wrapper for this date index
          const performanceWrapper = performanceWrappers[dateIndex];
          if (!performanceWrapper) {
            continue;
          }

          // Get all shows from this performance wrapper
          const showWrappers = performanceWrapper.querySelectorAll('.show-wrapper');
          for (let showIndex = 0; showIndex < showWrappers.length; showIndex++) {
            const show = showWrappers[showIndex];
            show.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            shows.push({
              time: show.querySelector('.showtime')?.textContent.trim() || 'Unknown Time',
              theater: show.querySelector('.theatre-name')?.textContent.trim() || 'Unknown Theater',
              attributes: Array.from(show.querySelectorAll('.attribute-logo')).map(attr => {
                let attribute = attr.querySelector('.screen-reader-text')?.textContent.trim() || 
                attr.dataset.attribute || 
                'Unknown Attribute';
                
                if (attribute.toLowerCase().includes('omd')) {
                  attribute = 'OmdU';
                } else if (attribute.toLowerCase().includes('ome')) {
                  attribute = 'OmeU';
                }
                
                return attribute;
              }),

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
        genre,
        duration,
        fsk,
        description,
        attributes,
        showtimes
      });

    }

    return movies;
  
  });

  console.log('Found', allMovieDates.length, 'movies');
  
  

  

  // 3. merge the two lists
  console.log('3. Merging movie infos with dates...');

  // Set a similarity threshold (e.g., 0.7 for 70% similarity)
  const SIMILARITY_THRESHOLD = 0.7;

  // Function to find the closest match for a given title
  function findClosestMatch(title, allMovieInfos) {
    const titles = allMovieInfos.map(info => info.title);

    const bestMatch = stringSimilarity.findBestMatch(title, titles);
    //console.log('Best match for', title, 'is', bestMatch.bestMatch.target, 'with similarity', bestMatch.bestMatch.rating);

    // Check if the best match's similarity score meets the threshold
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
      // console.log('Merging', date);
      // console.log('with', movieInfo);
      return { ...date, ...movieInfo };
    } else {
      return date; // Keep the original entry if no close match is found
    }
  });

  // 4. scrape higher resolution poster URLs
  console.log('4. Scraping higher resolution poster URLs...');
  async function scrapePosterUrls() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true, // Set to true for headless mode , or 'new'
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
                    // scplit the src string to get the higher resolution poster, after the first ?
                    // src = src.split('?')[0];
                    posters.push({ alt, src });
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
  // console.log('Fetched movie posters:', moviePosters);
  // and add them to the movies array
  for (const movie of movies) {
    const poster = moviePosters.find(poster => poster.alt.toLowerCase().includes(movie.title.toLowerCase()));
    if (poster) {
      movie.posterUrl = poster.src;
      //console.log(`Found poster for ${movie.title}:`, poster);
    } //else {
    //   console.log(`No poster found for ${movie.title}, fetching from TMDB...`);
    //   movie.posterUrl = await fetchPosterUrl(movie.title);
    //   console.log(`Fetched poster for ${movie.title}:`, movie.posterUrl);
    // }
  }


  


  // close the browser
  await browser.close();

  
  


  console.log('\nSaving data to file...');
  await fs.writeFile('movie_data.json', JSON.stringify(movies, null, 2));
  console.log('Data has been scraped and saved to movie_data.json');

}

      




scrapeCinema().catch(error => {
  console.error('Error in scraping:', error);
  process.exit(1);
});




// current Workflow:
// add breakpoint to 191, page.evaluate
// add breakpoint to 279, page.evaluate
// run in debug mode
// step over until 285 prints a valid "Found iframe URL:"
// a few more step over, wait a bit more
// disconnect from the debugger