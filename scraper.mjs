import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import { debug } from 'console';

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
    defaultViewport: { width: 1920, height: 1080 },
    headless: true, // Set to true for headless mode , or 'new'
    devtools: false,
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

  // TODO: factor out the following code into a separate function
  // const movieTrailerURLs = await page.evaluate(async () => {

  //   await new Promise(resolve => setTimeout(resolve, 500));

  //   return Array.from(document.querySelectorAll('.movie-item')).map(movieItem => {
  //     debugger;
  //     const title = movieItem.querySelector('.title')?.textContent.trim() || 'Unknown Title';
      
  //     //click on the trailer button to get the trailer URL
  //     movieItem.querySelector('.trailer-button').click();
      
  //     // click on extra button to agree to smth. <button class="button text-medium trailer-confirmation-button confirm cursor-pointer">Video laden</button>
  //     //<button class="button text-medium set-allowance cursor-pointer checked">Immer entsperren.</button>
  //     movieItem.querySelector('.checked').click();
  //     movieItem.querySelector('.trailer-confirmation-button').click();
  //     // get the trailer URL
  //     const trailerURL = movieItem.querySelector('#op-yt__player').src;
  //     return {
  //       title,
  //       trailerURL
  //     };
  //   });
  // });
  
  // console.log(movieTrailerURLs);
  
        




  console.log('Scraping movie data...');
  const movies = await page.evaluate(async () => {
    const debugLog = (msg) => {
      // Create a custom element to store our debug message
      const debugElement = document.createElement('div');
      debugElement.setAttribute('data-debug', msg);
      document.body.appendChild(debugElement);
    };

    await new Promise(resolve => setTimeout(resolve, 500));

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

  // for each saved showtime, click on the showtime and save the iframe url
  // we are doing this separately because inside the other loop we are not able to click on the showtime, as its not interactive
  for (const movie of movies) {
    for (const showtime of movie.showtimes) {
      for (const show of showtime.shows) {
        console.log(`Clicking on showtime for ${movie.title} on ${showtime.date} at ${show.time}`);
        await page.evaluate((title, date, time, theater) => {
          
          // first, match the title of the saved showtime with the title of the movie 
          const movieItems = Array.from(document.querySelectorAll('.movie-item'));
          let movieItem = null;
          console.log(`Looking for movie title: ${title}`);
          movieItems.forEach(item => {
            // itemTitle is the interactive part, title is the saved part
            const itemTitle = item.querySelector('.title')?.textContent.trim();
            console.log(`Found movie title: ${itemTitle}`);
            if (itemTitle.toLowerCase() === title.toLowerCase()) {
              // if the title matches, save the item in movieItem to look inside it for the date
              movieItem = item;
            }
          });

          // second, match the date of the saved showtime with the date of the already matched movieItem
          const dateGrids = Array.from(movieItem.querySelectorAll('.movie-times-grid'))
          const dateGrid = dateGrids[0].querySelectorAll('.date'); // in the first grid we have the dates, in all the others we have the showtimes
          let dateKey = null; // the index of the date item, to index the showtimes later
          console.log(`Looking for date: ${date}`);
          dateGrid.forEach((item, key) => {
            
            let itemDate = item.textContent.trim();
            // formating the date to match the saved date, should be in the format yyyy-mm-dd
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
            
            console.log(`Found date: ${itemDate}`);
            if (itemDate.toLowerCase() === date.toLowerCase()) {
              console.log(`Found date item for date: ${date}`);
              dateKey = key; // save the index of the date item to index the showtimes later
            }
          });

          // third, match the time of the saved showtime with the time of the already matched date
          dateGrids.shift(); // remove the first grid, as we already have the date
          let showWrapperAll = dateGrids[0]?.querySelectorAll('.performances-wrapper'); 
          let showWrapper = showWrapperAll[dateKey].querySelectorAll('.show-wrapper');
          // if the first grid is empty at the index of the date, directly look in the second grid
          if (!showWrapper || showWrapper.length === 0) {
            showWrapperAll = dateGrids[1]?.querySelectorAll('.performances-wrapper');
            showWrapper = showWrapperAll[dateKey].querySelectorAll('.show-wrapper');
          }
          let showItem = null;
          
          console.log(`Looking for show time: ${time}`);
          showWrapper.forEach(item => {
            let itemTime = item.querySelector('.showtime')?.textContent.trim();
            let itemTheater = item.querySelector('.theatre-name')?.textContent.trim();
            console.log(`Found show time: ${itemTime}`);
            // make sure the time as well as the theater match, as there could be multiple showtimes with the same time in different theaters
            if (itemTime.toLowerCase() === time.toLowerCase() && itemTheater.toLowerCase() === theater.toLowerCase()) {
              console.log(`Found show item for time: ${time}`);
              showItem = item;
            }
          });

          if (!showItem || showItem === null) {
            // if the showtime is not in the second grid, its position is in the third grid
            showWrapperAll = dateGrids[1]?.querySelectorAll('.performances-wrapper');
            showWrapper = showWrapperAll[dateKey].querySelectorAll('.show-wrapper');
            let showItem = null;
            console.log(`Looking for show time: ${time}`);
            showWrapper.forEach(item => {
              let itemTime = item.querySelector('.showtime')?.textContent.trim();
              console.log(`Found show time: ${itemTime}`);
              if (itemTime.toLowerCase() === time.toLowerCase()) {
                console.log(`Found show item for time: ${time}`);
                showItem = item;
              }
            });
          }

          // click on the showtime to get the iframe 
          showItem.click();
          return new Promise((resolve) => {
            setTimeout(resolve, 500);
        }
        );

        }, movie.title, showtime.date, show.time, show.theater);

    
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

  // Now fetch posters for all movies with fetchPosterUrlAlt
  console.log('\nFetching movie posters...');
  const moviePosters = await scrapePosterUrls();
  console.log('Fetched movie posters:', moviePosters);
  // and add them to the movies array
  for (const movie of movies) {

    const poster = moviePosters.find(poster => poster.alt.toLowerCase().includes(movie.title.toLowerCase()));
    
    if (poster) {
      movie.posterUrl = poster.src;
      console.log(`Found poster for ${movie.title}:`, poster);
    } else {
      console.log(`No poster found for ${movie.title}, fetching from TMDB...`);
      movie.posterUrl = await fetchPosterUrl(movie.title);
      console.log(`Fetched poster for ${movie.title}:`, movie.posterUrl);
    }
  }

  console.log('\nSaving data to file...');
  await fs.writeFile('movie_data.json', JSON.stringify(movies, null, 2));
  console.log('Data has been scraped and saved to movie_data.json');
}


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
                  const src = element.getAttribute('src');
                  alt = alt.replace('Filmplakat von ', '');
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