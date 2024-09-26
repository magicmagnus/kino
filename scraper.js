const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeCinema() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to cinema website...');
  await page.goto('https://tuebinger-kinos.de/programmuebersicht/');

  console.log('Scraping movie data...');
  const movies = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.movie-item')).map(movieItem => {
      const title = movieItem.querySelector('.title')?.textContent.trim() || 'Unknown Title';
      const genre = movieItem.querySelector('.genres')?.textContent.trim() || 'Unknown Genre';
      const duration = movieItem.querySelector('.length')?.textContent.trim() || 'Unknown Duration';
      const fsk = movieItem.querySelector('.fsk')?.textContent.trim() || 'Unknown FSK';
      const description = movieItem.querySelector('.description')?.textContent.trim() || 'No description available';
      
      const attributes = Array.from(movieItem.querySelectorAll('.attribute')).map(attr => attr.textContent.trim());

      const moreButton = movieItem.querySelector('.performance-item-more-dates');
        if (moreButton) {
            moreButton.click();
        }
        

      const showtimes = Array.from(movieItem.querySelectorAll('.movie-times-grid .performances-wrapper')).map((wrapper, index) => {
        const dateElement = movieItem.querySelector(`.movie-times-grid .date:nth-child(${index + 1})`);
        let date = dateElement ? dateElement.textContent.trim() : 'Unknown Date';
        // if the date is "Heute", convert it to the current date
        console.log(typeof date, date);
        if (date === 'Heute') {
            const today = new Date();
            date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
          } else {
            // Convert "Fr., 27.9." to a date in the current year
            const [ , day, month] = date.match(/(\d+)\.(\d+)\.$/) || [];
            if (day && month) {
              const year = new Date().getFullYear();
              date = `${year}-${month}-${day}`;
            }
          }
        
        const shows = Array.from(wrapper.querySelectorAll('.show-wrapper')).map(show => {
          const time = show.querySelector('.showtime')?.textContent.trim() || 'Unknown Time';
          const theater = show.querySelector('.theatre-name')?.textContent.trim() || 'Unknown Theater';
          const attributes = Array.from(show.querySelectorAll('.attribute-logo')).map(attr => 
            attr.querySelector('.screen-reader-text')?.textContent.trim() || attr.dataset.attribute || 'Unknown Attribute'
          );
          
          return { time, theater, attributes };
        });
        
        return { date, shows };
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
    });
  });

  await browser.close();

  console.log('Saving data to file...');
  await fs.writeFile('movie_data.json', JSON.stringify(movies, null, 2));
  console.log('Data has been scraped and saved to movie_data.json');
}

scrapeCinema().catch(console.error);