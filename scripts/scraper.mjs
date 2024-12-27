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
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // args: ['--start-maximized'],
    protocolTimeout: 300000 // Increase the protocol timeout to 5 minutes

  });
  const page = await browser.newPage();

  // Set the Accept-Language header to German
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'de-DE'
  });

  // Optionally, set the navigator.language to German
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'language', {
      get: function() {
        return 'de-DE';
      }
    });
    Object.defineProperty(navigator, 'languages', {
      get: function() {
        return ['de-DE'];
      }
    });
  });
  
  let allMovieInfos = [];
  const kinos = ["kino-museum-tuebingen", "kino-atelier-tuebingen", "kino-blaue-bruecke-tuebingen"];
  
  // 1. first scrape all movie infos except the dates/shotwimes from one page
  console.log('\n\t1. Scraping movie infos from "widget pages"...\n');
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
        // const title = movieItem.querySelector('.movie__title')?.textContent.trim() || 'Unknown Title';
        
        // some infos are nested in the short and long info sections
        const movieInfoShort = movieItem.querySelector('.movie__info--short');
        let duration = '0';
        let fsk = 'Unknown';
        let genre = 'Unknown Genre';
        for (let i = 0; i < movieInfoShort.querySelectorAll('dt').length; i++) {
          const dt = movieInfoShort.querySelectorAll('dt')[i].textContent.trim();
          const dd = movieInfoShort.querySelectorAll('dd')[i].textContent.trim();
          switch (dt) {
            case "Dauer":
              duration = dd;
              break;
            case "FSK":
              fsk = dd;
              break;
            case "Genre":
              genre = dd;
              break;
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

  function filterDuplicateTitles(movieList) {
    const titles = movieList.map(info => info.title);
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    if (duplicates.length > 0) {
      console.log('\nFound duplicate titles:', duplicates, '\nremoving duplicates...');
      return movieList.filter((info, index) => titles.indexOf(info.title) === index);
    }
    return movieList;
  }

  // check if there are any duplicates in the titles, cause we visit multiple kino pages which might have the same movies (redundant)
  allMovieInfos = filterDuplicateTitles(allMovieInfos);

  console.log('\nFound', allMovieInfos.length, 'movies from "widget pages"');
  


  // 2. Scrape the dates, showtimes and iframe URL from the other cinema website
  console.log('\n\t2. Scraping movie dates, showtimes and iframe URLs from "programmübersicht"...\n');
  await page.goto('https://tuebinger-kinos.de/programmuebersicht/', {
    waitUntil: 'networkidle0'
  });

  //Click all "more dates" buttons and wait for possible updates
  await page.evaluate(() => {
    debugger;
    const closeButton = document.querySelector('.brlbs-cmpnt-close-button');
    if (closeButton) {
        closeButton.click();
    }
    const listViewButton = document.querySelector('.overview-filter-header').querySelector('.overview-view-button-list');
    if (listViewButton) {
        listViewButton.click();
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
    debugger;
    const movies = [];
    const movieItems = document.querySelectorAll('.movie-item');

    for (const movieItem of movieItems) {
      
      const title = movieItem.querySelector('.title')?.textContent.trim() || 'Unknown Title';
      const attributes = formatAttributes(Array.from(movieItem.querySelectorAll('.attribute')).map(attr => attr.textContent.trim()));
      const duration = movieItem.querySelector('.minutes')?.textContent.trim() || '0';
      
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
            const today = new Date();
            let year = today.getFullYear();
            if (parseInt(month) < (today.getMonth() + 1)) {
              year += 1;
            }
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
            const room = show.querySelector('.theatre-name')?.textContent.trim() || 'Unknown Theater';
            
            

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
        
        // Correct the iframe URL for the shows
        const theatersAndRooms = {
          "museum": ["Saal Almodóvar", "Saal Coppola", "Saal Arsenal"],
          "atelier": ["Atelier"],
          "blaue-bruecke": ["Saal Tarantino", "Saal Spielberg", "Saal Kubrick"]
        }; 

        function getCinemaByTheater(theater) {
          for (const [cinema, rooms] of Object.entries(theatersAndRooms)) {
            if (rooms.includes(theater)) {
              return cinema;
            }
          }
          return null;
        }
        
        function correctIframeUrls(shows) {
          shows.forEach(show => {
            const theater = show.theater;
            const correctCinema = getCinemaByTheater(theater);
            if (correctCinema && !show.iframeUrl.includes(correctCinema)) {
              console.log('Correcting iframe URL for', show.theater, 'to', correctCinema);
              show.iframeUrl = show.iframeUrl.replace(/kino-[^/]+/, `kino-${correctCinema}-tuebingen`);
            }
          });
          return shows;
        }

        correctIframeUrls(shows);

        showtimes.push({
          date,
          shows
        });
      }
      movies.push({
        title,
        attributes,
        duration,
        showtimes
      });
    }
    return movies;
  });

  console.log('\Found', allMovieDates.length, 'movies from "programmübersicht"');
  

  // 3. merge the two lists
  console.log('\n\t3. Merging movie infos with dates...\n');

  // Set a similarity threshold (e.g., 0.7 for 70% similarity)
  const SIMILARITY_THRESHOLD = 0.2;

  

  // Function to find the closest match for a given title
  function findClosestMatch(title, titles) {

    const lowerCaseTitles = titles.map(t => t.toLowerCase());
    const bestMatch = stringSimilarity.findBestMatch(title.toLowerCase(), lowerCaseTitles);

    if (bestMatch.bestMatch.rating >= SIMILARITY_THRESHOLD) {
      const originalTitle = titles[lowerCaseTitles.indexOf(bestMatch.bestMatch.target)];
      console.log('Best match for', title, 'is', originalTitle , 'with a similarity of', bestMatch.bestMatch.rating);
      return originalTitle;
    } else {
      console.log('No close match found for', title, 'with a similarity of', bestMatch.bestMatch.rating );
      return null;
    }
  }

  // Merge all properties of the same movie title from the two lists into one list
  const movies = allMovieDates.map((date, index) => {
    const closestTitle = findClosestMatch(date.title, allMovieInfos.map(info => info.title));
    if (closestTitle) {
      const movieInfo = allMovieInfos.find(info => info.title === closestTitle);
      // remove movieInfor from the list
      allMovieInfos = allMovieInfos.filter(info => info.title !== closestTitle);
      return { id: index, ...movieInfo, ...date , title: closestTitle }; // Merge the two entries
    } else {
      return { id: index, ...date }; // Keep the original entry if no close match is found
    }
  });

  console.log('\nMerged', movies.length, 'movies with dates and showtimes');
  console.log('\nNo showtimes found for', allMovieInfos.length, 'movies found in "widget pages":');
  console.log(allMovieInfos.map(info => info.title));
  

  // 4. scrape higher resolution poster URLs
  console.log('\n\t4. Scraping higher resolution poster URLs from "non-widget pages"...\n');
  async function scrapePosterUrls() {
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1920, height: 1080 },
        headless: true, 
        devtools: false,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        protocolTimeout: 300000 // Increase the protocol timeout to 5 minutes
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
                      title: alt,
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

  // TODO with the stringSimilarity library, find the best match for each movie title and the poster alt text
  let moviePosters = await scrapePosterUrls();

  moviePosters = filterDuplicateTitles(moviePosters);

  console.log('\nFound', moviePosters.length, 'movie posters from "non-widget pages"');

  console.log('\n\t5. Merging movies with higher resolution poster URLs...\n');
  for (const movie of movies) {
    const closestTitle = findClosestMatch(movie.title, moviePosters.map(poster => poster.title));
    if (closestTitle) {
      const poster = moviePosters.find(poster => poster.title === closestTitle);
      // remove poster from the list
      moviePosters = moviePosters.filter(p => p.title !== closestTitle);
      movie.posterUrl = poster.src;
    }
  }
  await browser.close();

  console.log('\nMerged', movies.length, 'movies with higher resolution poster URLs');
  console.log('\nNo showtimes found for', moviePosters.length, 'posters found in "non-widget pages": ');
  console.log(moviePosters.map(poster => poster.title));

  console.log('\n\tSaving data to file...\n');
  await fs.writeFile('data/source_movie_data.json', JSON.stringify(movies, null, 2));
  console.log('Data has been scraped and saved to movie_data.json');

}

      
// Run the main function
scrapeCinema().catch(error => {
  console.error('Error in scraping:', error);
  process.exit(1);
});
