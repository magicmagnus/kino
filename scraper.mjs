import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';

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


async function scrapeCinema() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    //headless: false,  // Set to false to see what's happening
    // args: ['--start-maximized'],
    defaultViewport: null,
    headless: false,
    devtools: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']

  });
  const page = await browser.newPage();
  
  console.log('Navigating to cinema website...');
  await page.goto('https://tuebinger-kinos.de/programmuebersicht/', {
    waitUntil: 'networkidle0'
  });

  // Click all "more dates" buttons and wait for possible updates
  console.log('Expanding all movie dates...');
  await page.evaluate(() => {
    return new Promise((resolve) => {
      document.querySelectorAll('.performance-item-more-dates').forEach(button => button.click());
      setTimeout(resolve, 5000); // Wait 1 second after clicking all buttons
      // add another button click to each button .buy-ticket-button 
      
    });
  });

  console.log('Scraping movie data...');
  const movies = await page.evaluate(() => {
    const debugLog = (msg) => {
      // Create a custom element to store our debug message
      const debugElement = document.createElement('div');
      debugElement.setAttribute('data-debug', msg);
      document.body.appendChild(debugElement);
    };

    return Array.from(document.querySelectorAll('.movie-item')).map(movieItem => {
      try {
        const title = movieItem.querySelector('.title')?.textContent.trim() || 'Unknown Title';
        debugLog(`Processing movie: ${title}`);

        // Basic movie info
        const genre = movieItem.querySelector('.genres')?.textContent.trim() || 'Unknown Genre';
        const duration = movieItem.querySelector('.length')?.textContent.trim() || 'Unknown Duration';
        const fsk = movieItem.querySelector('.fsk')?.textContent.trim() || 'Unknown FSK';
        const description = movieItem.querySelector('.description')?.textContent.trim() || 'No description available';
        const attributes = Array.from(movieItem.querySelectorAll('.attribute')).map(attr => attr.textContent.trim());
          
        

        // Get all movie-times-grids
        let timeGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'));
        debugLog(`Found ${timeGrids.length} movie-times-grids for ${title}`);

        if (timeGrids.length === 0) {
          debugLog(`No time grids found for ${title}`);
          // return null;
          // try clikng on the buy ticket button, its inside the movie-item-content class
          debugLog(`Trying to click on the buy ticket button for ${title}`);
          movieItem.querySelector('.buy-ticket-button').click();
          timeGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'));
          debugLog(`Found ${timeGrids.length} movie-times-grids for ${title}`);

          // return null;


        }

        // First grid contains the dates
        const dateGrid = timeGrids[0];
        const dates = Array.from(dateGrid.querySelectorAll('.date')).map(dateElement => {
          let date = dateElement.textContent.trim();
          debugLog(`Found date: ${date}`);
          
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

        debugLog(`Processing ${dates.length} dates for ${title}`);

        // Process showtimes for each date
        const showtimes = dates.map((date, dateIndex) => {
          const shows = [];
          
          // Start from index 1 to skip the date grid
          for (let gridIndex = 1; gridIndex < timeGrids.length; gridIndex++) {
            const theaterGrid = timeGrids[gridIndex];
            const performanceWrappers = theaterGrid.querySelectorAll('.performances-wrapper');
            
            debugLog(`Grid ${gridIndex}: Found ${performanceWrappers.length} performance wrappers`);

            // Get the performance wrapper for this date index
            const performanceWrapper = performanceWrappers[dateIndex];
            if (!performanceWrapper) {
              debugLog(`No performance wrapper found for date index ${dateIndex} in grid ${gridIndex}`);
              continue;
            }

            // Get all shows from this performance wrapper
            const showWrappers = performanceWrapper.querySelectorAll('.show-wrapper');
            showWrappers.forEach(show => {
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
              })
              });
            });
          }

          return {
            date,
            shows
          };
        });

        return {
          title,
          genre,
          duration,
          fsk,
          attributes,
          description,
          showtimes

        };
      } catch (error) {
        debugLog(`Error processing movie: ${error.message}`);
        return null;
      }
    }).filter(movie => movie !== null);
  });

  for (const movie of movies) {
    for (const showtime of movie.showtimes) {
      for (const show of showtime.shows) {
        console.log(`Clicking on showtime for ${movie.title} on ${showtime.date} at ${show.time}`);
        await page.evaluate((title, date, time) => {
          //debugger;
          const movieItems = Array.from(document.querySelectorAll('.movie-item'));
          let movieItem = null;
          //debugger;
          console.log(`Looking for movie title: ${title}`);
          movieItems.forEach(item => {
            
            const itemTitle = item.querySelector('.title')?.textContent.trim();
    
            console.log(`Found movie title: ${itemTitle}`);
            if (itemTitle.toLowerCase() === title.toLowerCase()) {
              console.log(`Found movie item for title: ${title}`);
              movieItem = item;
            }
          });

          if (!movieItem) {
            console.error(`Movie item not found for title: ${title}`);
            return;
          }
          const dateGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'))
          const dateGrid = dateGrids[0].querySelectorAll('.date');
          let dateItem = null;
          let dateKey = null; // the index of the date item
          //debugger;
          console.log(`Looking for date: ${date}`);
          dateGrid.forEach((item, key) => {
            //debugger;
            let itemDate = item.textContent.trim();
            if (itemDate === 'Heute') {
              const today = new Date();
              itemDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
            } else {
              const [, day, month] = itemDate.match(/(\d+)\.(\d+)\.$/) || [];
              if (day && month) {
                const year = new Date().getFullYear();
                itemDate = `${year}-${month}-${day}`;
              }
            }
            //debugger;
            console.log(`Found date: ${itemDate}`);
            if (itemDate.toLowerCase() === date.toLowerCase()) {
              console.log(`Found date item for date: ${date}`);
              dateItem = item;
              dateKey = key;
            }
          });

          if (!dateGrid) {
            console.error(`Date grid not found for date: ${date}`);
            return;
          }
          // delete the first entry of the dateGrids array###########
          dateGrids.shift();
          dateGrids.forEach(item => {
            const perfWrapper = item.querySelectorAll('.performances-wrapper'); 
            const showWrapper = perfWrapper[dateKey].querySelectorAll('.show-wrapper');
            let showItem = null;
            debugger;
            console.log(`Looking for show time: ${time}`);
            showWrapper.forEach((item, showItem) => {
              //debugger;
              let itemTime = item.querySelector('.showtime')?.textContent.trim();
              console.log(`Found show time: ${itemTime}`);
              if (itemTime.toLowerCase() === time.toLowerCase()) {
                console.log(`Found show item for time: ${time}`);
                showItem = item;
              }
            });
          });
          ///###################

          if (!showItem) {
            console.error(`Show item not found for time: ${time}`);
            return;
          }
          //debugger;
          console.log('Clicking on show item');
          showItem.click();


        }, movie.title, showtime.date, show.time);

        //await page.waitForTimeout(2000); // Wait for the iframe to load

        const iframeUrl = await page.evaluate(() => {
          const iframe = document.querySelector('iframe');
          return iframe ? iframe.src : "not found";
        });

        show.iframeUrl = iframeUrl;
        console.log(`Found iframe URL: ${iframeUrl}`);
      }
    }
  }

  // Retrieve debug logs
  const debugLogs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-debug]')).map(el => el.getAttribute('data-debug'));
  });

  // Print debug logs
  console.log('\nDebug logs from browser context:');
  debugLogs.forEach(log => console.log(log));

  await browser.close();

  // Now fetch posters for all movies
  console.log('\nFetching movie posters...');
  for (const movie of movies) {
    console.log(`Fetching poster for: ${movie.title}`);
    movie.posterUrl = await fetchPosterUrl(movie.title);
    // Add a small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\nSaving data to file...');
  await fs.writeFile('movie_data.json', JSON.stringify(movies, null, 2));
  console.log('Data has been scraped and saved to movie_data.json');
}



scrapeCinema().catch(error => {
  console.error('Error in scraping:', error);
  process.exit(1);
});

