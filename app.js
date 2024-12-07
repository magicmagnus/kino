// Variables
const today = new Date();
const TODAY_YEAR = today.getFullYear();
const TODAY_MONTH = today.getMonth() + 1;
const TODAY_DAY = today.getDate();
const TODAY_FORMATTED = `${TODAY_YEAR}-${TODAY_MONTH}-${TODAY_DAY}`;
const THEATERS = getTheaters();

const START_HOUR = 9; // Start hour for the timescale
const TOTAL_HOURS = 16; // Total hours for the timescale

const MOVIE_DATA = [];

const DATE_VIEW = document.getElementById('date-view');
const ROOM_VIEW = document.getElementById('room-view');
const FILTER_VIEW = document.getElementById('filter-view');

let globalDayIndex = 0;
let currentView = 'date';
let firstDate = TODAY_FORMATTED; // temporarily set to today, could be changed later

const translations = {
    en: {
        dateViewLabel: "Date",
        roomViewLabel: "Room",
        movieViewLabel: "Movie",
        searchLabel: "Search",
        omduLabel: "Original with Subtitles",
        selectMoviePlaceholder: "Select a movie",
        todayLabel: "Today",
        nowLabel: "Now",
        dateFormat: "en-UK",
        selectMovieAlert: "Please select a movie to filter by.",
        tagline: "The program of the Tübingen cinemas",
        minuteLabel: "Minute",
        minutesLabel: "Minutes",
        hourLabel: "Hour",
        hoursLabel: "Hours",
        allShowings: "All Showings",
        buyTickets: "Buy tickets for",
    },
    de: {
        dateViewLabel: "Datum",
        roomViewLabel: "Saal",
        movieViewLabel: "Film",
        searchLabel: "Suchen",
        omduLabel: "OmdU",
        selectMoviePlaceholder: "Film auswählen",
        todayLabel: "Heute",
        nowLabel: "Jetzt",
        dateFormat: "de-DE",
        selectMovieAlert: "Bitte wählen Sie einen Film, um nach diesem zu filtern.",
        tagline: "Das Programm der Tübinger Kinos",
        minuteLabel: "Minute",
        minutesLabel: "Minuten",
        hourLabel: "Stunde",
        hoursLabel: "Stunden",
        allShowings: "Alle Vorstellungen",
        buyTickets: "Karten kaufen für",
    }
};
const userLang = navigator.language || navigator.userLanguage;
const language = userLang.startsWith('de') ? 'de' : 'en';
// const language = 'en';

// Modify your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async function() {

    handleThemeChange(); // light/dark theme toggle handler

    initializeViewHandlers(); // event listners for all 3 views and their buttons

    await loadMovieData(); // Load movie data from JSON file
   
    document.getElementById('date-view-btn').click(); // Show the date view by default

    adjustContentMargin();

    setInterval(updateCurrentTimeLine, 60000); // Update the current time line every minute

    updateLanguage(); // Update the language based on user's browser settings
});

function updateLanguage() {
    document.getElementById('date-view-btn').innerHTML = `<i class="bi bi-calendar3"></i> ${translations[language].dateViewLabel}`;
    document.getElementById('room-view-btn').innerHTML = `<i class="bi bi-door-closed-fill"></i> ${translations[language].roomViewLabel}`;
    document.getElementById('movie-view-btn').innerHTML = `<i class="bi bi-film"></i> ${translations[language].movieViewLabel}`;
    document.getElementById('filter-view-btn').innerHTML = `<i class="bi bi-search"></i> ${translations[language].searchLabel}`;
    document.getElementById('omdu-check-label').textContent = translations[language].omduLabel;
    document.getElementById('movie-dropdown').querySelector('option[value=""]').textContent = translations[language].selectMoviePlaceholder;
    document.querySelectorAll('.current-time-text').forEach(el => el.textContent = translations[language].nowLabel);
    document.getElementById('tagline').textContent = translations[language].tagline;
}

// Function to fetch and load movie data
async function loadMovieData() {
    try {
        const response = await fetch('movie_data.json');
        const data = await response.json();
        MOVIE_DATA.push(...data);
        populateMovieDropdown(MOVIE_DATA);
    } catch (error) {
        console.error('Error loading movie data:', error);
    }
}

// Populate the movie dropdown
function populateMovieDropdown(movies) {
    const movieDropdown = document.getElementById('movie-dropdown');
    movies.forEach(movie => {
        const option = document.createElement('option');
        option.value = movie.id; // Assuming each movie has a unique 'id'
        option.textContent = movie.title;
        movieDropdown.appendChild(option);
    });
    movieDropdown.value = ''; // by default, the select should be disabled
}

function enableOmduChecker(attributes) {
    const omduChecker = document.getElementById('omdu-check');
    if (attributes.some(attr => attr.toLowerCase() === 'omdu')) {
        omduChecker.disabled = false;
    } else {
        omduChecker.disabled = true;
        omduChecker.checked = false;
    }
}

// Filter showtimes based on movie and attribute
function filterShowtimesOmdu(movie) {
    return movie.showtimes.map(showtime => {
        const shows = showtime.shows.filter(show => show.attributes.some(attr => attr.toLowerCase() === 'omdu'));
        return { ...showtime, shows };
    }).filter(showtime => showtime.shows.length > 0);
}

// Render the filter view
function renderFilterView(showtimes, movie) {
    FILTER_VIEW.innerHTML = ''; // Clear existing view

    // Define the desired order of theaters
    const theaterOrder = [
        "Saal Tarantino",
        "Saal Spielberg",
        "Saal Kubrick",
        "Saal Almodóvar",
        "Saal Arsenal",
        "Saal Coppola",
        "Atelier"
    ];

    // first group the showtimes by date
    const dates = groupBy(showtimes, 'date');
    // for all dates
    console.log("all days", dates)
    Object.keys(dates).forEach((date, indexDates) => {
       
        if (date < TODAY_FORMATTED) {
            return;
        }
        const isDateToday = date === TODAY_FORMATTED;
        
        const roomHeader = document.createElement('div');
        roomHeader.classList.add('filter-date-header');
        const options = { weekday: 'long', day: 'numeric', month: 'numeric' };
        const dateObj = new Date(date);
        roomHeader.innerHTML = `${(isDateToday ? translations[language].todayLabel + ', ' : '') + dateObj.toLocaleDateString(translations[language].dateFormat, options)}`;
        FILTER_VIEW.appendChild(roomHeader);

        const timelines = groupBy(dates[date][0].shows, 'theater');
        // if (Object.keys(timelines).length === 0) {
        //     FILTER_VIEW.removeChild(roomHeader);
        //     return;
        // }

        // sort the timelines to be in the same order as the theaters in the date view 
        const sortedTimelines = Object.keys(timelines).sort((a, b) => {
            return theaterOrder.indexOf(a) - theaterOrder.indexOf(b);
        });

        
        // for all the rooms/theaters, create a schedule div
        sortedTimelines.forEach((theater, indexRooms) => {
            const schedule = createRoomSchedule(theater, indexRooms === 0, isDateToday, indexRooms);
            // for all the shows in the room/theater, create a movie block
            timelines[theater].forEach(show => {
                schedule.querySelector('.timeline-content').appendChild(createMovieBlock(movie, show, date));
            });
            FILTER_VIEW.appendChild(schedule);
            drawHourlyLines(schedule, indexRooms === 0);
            isDateToday ? updateCurrentTimeLine() : null;
            
        });
    });

    
    
    mergeScrolling(); // fix the scrolling of all timelines to each other

    adjustContentMargin(); // update the content position based on the header height

}


// Group an array of objects by a key
function groupBy(array, key) {
    return array.reduce((result, item) => {
        (result[item[key]] = result[item[key]] || []).push(item);
        return result;
    }, {});
}




function adjustContentMargin() {
    const header = document.querySelector('.header');
    const content = document.querySelector('.content');
    const headerHeight = header.offsetHeight;
    content.style.marginTop = headerHeight + 'px';
}

function initializeViewHandlers() {
    // initialize all event listeners for the view toggle, movie selection and filter button

   

    // date view button 
    document.getElementById('date-view-btn').addEventListener('click', function () {
        currentView = 'date';
        this.classList.add('active');
        const buttonContainer = document.querySelector('.movie-view-container');
        buttonContainer.style.display = 'none';
        document.getElementById('room-view-btn').classList.remove('active');
        document.getElementById('movie-view-btn').classList.remove('active');
        DATE_VIEW.style.display = 'block';
        ROOM_VIEW.style.display = 'none';
        FILTER_VIEW.style.display = 'none';
        initializeDateView();
        adjustContentMargin(); // update the content position based on the header height
    });

    // room view button
    document.getElementById('room-view-btn').addEventListener('click', function () {
        currentView = 'room';
        this.classList.add('active');
        const buttonContainer = document.querySelector('.movie-view-container');
        buttonContainer.style.display = 'none';
        document.getElementById('date-view-btn').classList.remove('active');
        document.getElementById('movie-view-btn').classList.remove('active');
        DATE_VIEW.style.display = 'none';
        ROOM_VIEW.style.display = 'block';
        FILTER_VIEW.style.display = 'none';
        initializeRoomView();
        adjustContentMargin(); // update the content position based on the header height
    });

    // filter view button
    document.getElementById('movie-view-btn').addEventListener('click', function () {
        // in filter view, we hide the date/room buttons
        const dropdownContainer = document.querySelector('.movie-view-container');
        dropdownContainer.style.display = 'flex';
        const buttonContainer = document.querySelector('.date-buttons-container');
        buttonContainer.innerHTML = '';
        this.classList.add('active');
        document.getElementById('date-view-btn').classList.remove('active');
        document.getElementById('room-view-btn').classList.remove('active');

        // directly prompt the user to select a movie from the dropdown by opening the dropdown
        document.getElementById('movie-dropdown').focus();
        
    });

    

    // handle the movie dropdown change
    document.getElementById('movie-dropdown').addEventListener('change', function () {
        const selectedMovie = MOVIE_DATA.find(movie => movie.id == this.value);
        if (selectedMovie) {
            enableOmduChecker(selectedMovie.attributes);
        }
    });
    document.getElementById('omdu-check').disabled = true; // Disable the omdu checker by default
    document.getElementById('omdu-check').checked = false;

    // handle the filter button
    document.getElementById('filter-view-btn').addEventListener('click', async function () {
        const movieId = document.getElementById('movie-dropdown').value;
        const omduChecked = document.getElementById('omdu-check').checked;
        if (!movieId) {
            alert(translations[language].selectMovieAlert);
            return;
        }
        // 
        currentView = 'filter';
        // Toggle visibility of views
        DATE_VIEW.style.display = 'none';
        ROOM_VIEW.style.display = 'none';
        FILTER_VIEW.style.display = 'block';
        console.log("Current view: ", currentView);

        


        const selectedMovie = MOVIE_DATA.find(movie => movie.id == movieId);
        const filteredShowtimes = omduChecked ? filterShowtimesOmdu(selectedMovie) : selectedMovie.showtimes;

        // in filter view, we hide the date/room buttons
        const buttonContainer = document.querySelector('.dropdown-container');
        buttonContainer.style.display = 'flex';

        renderFilterView(filteredShowtimes, selectedMovie);
    });
}

function handleThemeChange() {
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        themeToggle.innerHTML = `<i class="bi bi-sun"></i>`;
    } else {
        themeToggle.innerHTML = `<i class="bi bi-moon"></i>`;
    }

    themeToggle.addEventListener('click', function () {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = `<i class="bi bi-sun"></i>`;
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.innerHTML = `<i class="bi bi-moon"></i>`;
            localStorage.setItem('theme', 'light');
        }
    });
}

// DATE VIEW FUNCTIONS #####################################################################
// for date view
function initializeDateView() {
    // Clear the room buttons
    const buttonContainer = document.querySelector('.date-buttons-container');
    buttonContainer.innerHTML = '';

    // Create date buttons
    for (let i = 0; i < 9; i++) {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-secondary', 'me-2');
        const date = new Date(today);
        date.setDate(TODAY_DAY + i);

        if (i === 0) {
            button.textContent = translations[language].todayLabel;
        } else {
            const options = { weekday: 'short', day: 'numeric', month: 'numeric' };
            button.textContent = date.toLocaleDateString(translations[language].dateFormat, options);
        }

        setupDateButton(button, date, i);
        buttonContainer.appendChild(button);

        // Activate first button by default
        if (i === 0) {
            button.click();
        }
    }

    // fix the scrolling of all timelines to each other
    mergeScrolling();

    // plot the time scale for the date view
    document.querySelectorAll('.schedule').forEach((schedule, index) => {
        drawHourlyLines(schedule, index === 0);
    });
}

// for date view
function setupDateButton(button, date, dayIndex) {
    button.addEventListener('click', () => {
        setGlobalDayIndex(dayIndex);
        clearMovieBlocksDateView();
        populateMoviesForRoomSchedule(date, dayIndex);
        document.querySelector('.date-buttons-container').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    });
}

// for date view
function populateMoviesForRoomSchedule(date, dayIndex) {
    // Format the date to match JSON
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month}-${day}`;

    // only show and update the current time line if it is the first day
    if (dayIndex === 0) {
        updateCurrentTimeLine();
    } else {
        hideCurrentTimeLineDateView();
    }

    MOVIE_DATA.forEach(movie => {
        const showtimes = movie.showtimes.find(show => show.date === formattedDate);
        if (showtimes) {
            showtimes.shows.forEach(show => {
                THEATERS[show.theater].appendChild(createMovieBlock(movie, show, date));
            });
        }
    });
}

// for date view
function setGlobalDayIndex(index) {
    globalDayIndex = index;
}

// for date view
function clearMovieBlocksDateView() {
    document.querySelectorAll('.movie-block').forEach(block => block.remove());
}

// for date view
function hideCurrentTimeLineDateView() {
    DATE_VIEW.querySelectorAll('.current-time').forEach(line => line.style.display = 'none');
    DATE_VIEW.querySelectorAll('.current-time-text').forEach(text => text.style.display = 'none');
}
// END OF DATE VIEW FUNCTIONS #####################################################################


// ROOM VIEW FUNCTIONS #####################################################################
// for room view
function initializeRoomView() {
    // Clear the date buttons 
    const buttonContainer = document.querySelector('.date-buttons-container');
    buttonContainer.innerHTML = '';

    // Create room buttons
    Object.keys(THEATERS).forEach((theater, index) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-secondary', 'me-2');
        button.textContent = theater;
        
        setupRoomButton(button, theater);
        buttonContainer.appendChild(button);
        
        // Activate first button by default
        if (index === 0) {
            button.click();
        }   
    });
    
}

// for room view
function setupRoomButton(button, theater) {
    button.addEventListener('click', () => {
        loadScheduleForRoom(theater);
        document.querySelector('.date-buttons-container').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    });
}

// for room view
function loadScheduleForRoom(theater) {
    ROOM_VIEW.innerHTML = '';
    
    const dates = new Set();
    MOVIE_DATA.forEach((movie) => {
        movie.showtimes.forEach((showtime) => {
            if (showtime.shows.some((show) => show.theater === theater)) {
                dates.add(showtime.date);
            }
        });
    });

    let sortedDates = Array.from(dates);
    sortedDates.sort((a, b) => new Date(a) - new Date(b));
    if (sortedDates.includes(TODAY_FORMATTED)) {
        sortedDates = sortedDates.slice(sortedDates.indexOf(TODAY_FORMATTED));
    }

    // Reset firstDate when loading room schedule
    firstDate = sortedDates[0];
    
    // Reset globalDayIndex based on firstDate
    globalDayIndex = firstDate === TODAY_FORMATTED ? 0 : -1;

    sortedDates.forEach((date, index) => {
        const dateObj = new Date(date);
        const schedule = createDateSchedule(date, dateObj, index === 0);
        drawHourlyLines(schedule, index === 0);
        ROOM_VIEW.appendChild(schedule);
        populateMoviesForDateSchedule(schedule, date, theater);
    });
    
    mergeScrolling(); // fix the scrolling of all timelines to each other
    
    updateCurrentTimeLine(); // 
}

// for room view OPTIMIZED
function createDateSchedule(date, dateObj, isFirst = false) {
    // (used in the room view)
    // for each date, create a schedule div
    const schedule = document.createElement('div');
    schedule.classList.add('schedule');
    if (isFirst) {
        schedule.id = 'first-schedule';
    }
    
    const options = { weekday: 'short', day: 'numeric', month: 'numeric' };
    const dateDisplay = dateObj.toLocaleDateString(translations[language].dateFormat, options);
    
    schedule.innerHTML = `
        ${isFirst ? `<div class="schedule-name" id="first-schedule-name">` : `<div class="schedule-name">`}
            <h5>${dateDisplay}</h5>
            ${isFirst ? `<div class="fade-in" id="first-fade-in1"></div>` : ''}
            ${isFirst ? `<div class="fade-in" id="first-fade-in2"></div>` : `<div class="fade-in"></div>`}
        </div>
        ${isFirst ? `<div class="timeline-container" id="first-timeline-container">` : `<div class="timeline-container">`}
            ${isFirst ? `<div class="timeline" id="first-timeline">` : `<div class="timeline">`}
                <div class="timeline-content" id="timeline-${date}">
                    ${isFirst ? `<div class="current-time"></div>` : ''}
                    ${isFirst ? `<div class="current-time-text">${translations[language].nowLabel}</div>` : ''}
                </div>
            </div>
        </div>
    `;

    return schedule;
}

// analogously, 
function createRoomSchedule(theater, isFirst = false, isToday = false, index) {
    // (used in the filter view)
    // for each room/theater, create a schedule div
    const schedule = document.createElement('div');
    schedule.classList.add('schedule');
    if (isFirst) {
        schedule.id = 'first-schedule';
    }
    
    schedule.innerHTML = `
        ${isFirst ? `<div class="schedule-name" id="first-schedule-name">` : `<div class="schedule-name">`}
            <h5>${theater}</h5>
            ${isFirst ? `<div class="fade-in" id="first-fade-in1"></div>` : ''}
            ${isFirst ? `<div class="fade-in" id="first-fade-in2"></div>` : `<div class="fade-in"></div>`}
            ${isFirst ? `<div class="fade-in" id="first-fade-in3"></div>` : ''}
        </div>
        ${isFirst ? `<div class="timeline-container" id="first-timeline-container">` : `<div class="timeline-container">`}
            ${isFirst ? `<div class="timeline" id="first-timeline">` : `<div class="timeline">`}
                <div class="timeline-content" id="saal-${theater}">
                    ${isToday ? `<div class="current-time"></div>` : ''}
                    ${(isToday && index === 0) ? `<div class="current-time-text">${translations[language].nowLabel}</div>` : ''}
                </div>
            </div>
        </div>
    `;

    return schedule;
}

function populateMoviesForDateSchedule(schedule, date, theater) {
    // (used in the room view)
    const timelineContent = schedule.querySelector('.timeline-content');
   
    MOVIE_DATA.forEach(movie => {
        const showtime = movie.showtimes.find(st => st.date === date);
        if (showtime) {
            showtime.shows.forEach(show => {
                if (show.theater === theater) {
                    timelineContent.appendChild(createMovieBlock(movie, show, date));
                }
            });
        }
    });  
}
// END OF ROOM VIEW FUNCTIONS #####################################################################

function createMovieBlock(movie, show, date) {

    const movieBlock = document.createElement('div');
    movieBlock.classList.add('movie-block');
    movieBlock.style.left = `${calculateTimePercentage(show.time)}%`;
    
    const endTime = calculateEndTime(show.time, movie.duration);
    const right = calculateTimePercentage(endTime);
    movieBlock.style.width = `${right - calculateTimePercentage(show.time)}%`;

    if (movie.duration == "Unknown Duration" || movie.duration === "0") {
        movieBlock.style.width = "250px";
    }
    const posterUrl = movie.posterUrl == null ? "placeholder.jpg" : movie.posterUrl;
    
    movieBlock.innerHTML = `
        <div class="movie-block-inner">
            <img src="${posterUrl}" alt="${movie.title} poster">
            <div class="movie-block-info">
                <div class="movie-block-title-wrapper">
                    <strong>${movie.title}</strong> 
                </div>
                <div class="movie-block-attributes">
                    ${show.attributes[1] ? `<div class="omdu"><i class="bi bi-translate me-1"></i><p>${show.attributes[1]}</p></div>` : ''}
                    <div class="show-time">${show.time} - ${endTime}</div>
                </div>
            </div>
        </div>
    `;
    
    movie.duration.split(' ')[0] > 260 ? (movieBlock.style.zIndex = 1) : null;
    movie.title.length >= 35 ? (movieBlock.style.fontSize = "0.9rem") : (movieBlock.style.fontSize = "1.1rem");
    if (movie.title.length >= 35) {
        const fontSize = Math.max(1.0 - (movie.title.length - 35) * 0.007, 0.7); // Adjust the decrement as needed
        movieBlock.style.fontSize = fontSize + 'rem';
        movieBlock.style.lineHeight = '1.0';
    } else {
        movieBlock.style.fontSize = "1.1rem";
        movieBlock.style.lineHeight = '1.0';
    }

    movieBlock.addEventListener('click', function() {
        createMovieCard(movie, show, endTime, date);
    });

    return movieBlock;
}

function createMovieCard(movie, show, endTime, date) {
   
    const modal = document.createElement('div');
    let movieDuration = parseInt(movie.duration.split(' ')[0], 10);
    const options = { weekday: 'short', day: 'numeric', month: 'numeric' };
    const dateDisplay = new Date(date).toLocaleDateString(translations[language].dateFormat, options);
    // movie dureation convert to X hours and Y minutes
    let movieDurationHours = Math.floor(movieDuration / 60);
    let movieDurationMinutes = movieDuration % 60;
    // if the movie duration is less than 60 minutes, we dont want to display 0 hours
    if (movieDurationHours === 0) {
        movieDuration = `${movieDurationMinutes} ${translations[language].minutesLabel}`;
    } else if (movieDurationHours === 1) {
        movieDuration = `${movieDurationHours} ${translations[language].hourLabel}, ${movieDurationMinutes} ${translations[language].minutesLabel}`;
    } else if (movieDurationMinutes === 1) {
        movieDuration = `${movieDurationHours} ${translations[language].hoursLabel}, ${movieDurationMinutes} ${translations[language].minuteLabel}`;
    } else {
        movieDuration = `${movieDurationHours} ${translations[language].hoursLabel}, ${movieDurationMinutes} ${translations[language].minutesLabel}`;
    }
    modal.classList.add('custom-modal');


    // check the current theme for settinng the button colors
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const buttonClass = currentTheme === 'dark' ? 'btn-close btn-close-white' : 'btn-close';
    const closeEl = `<span class="custom-modal-close">
                        <button type="button" class="${buttonClass}" aria-label="Close"></button>
                    </span>`;
    const posterEl = `
        <div class="custom-modal-poster-wrapper">
            <img src="${movie.posterUrl}" alt="${movie.title} poster" class="custom-modal-poster">
            ${movie.trailerUrl != "Unknown Trailer URL" ? `<a href="${movie.trailerUrl}" id="trailer-button" target="_blank" class="btn btn-secondary " style="text-decoration: none; color: white;">
                <i class="bi bi-play-circle"></i> Trailer
            </a>` : ''}
        </div>
        `;
    const attributesEl = `<div class="custom-modal-attributes">
                            <h3 class="custom-modal-time"><i class="bi bi-clock me-2"></i>${movieDuration}</h3>
                            <h3 class="custom-modal-genre"><i class="bi bi-tags me-2"></i>${movie.genre}</h3>
                            <h3 class="custom-modal-fsk"><i class="bi bi-exclamation-circle me-2"></i>FSK ${movie.fsk}</h3>
                            ${show.attributes[1]? `<h3 class="omdu"><i class="bi bi-translate me-2"></i><p>${show.attributes[1]}</p></h3>` : ''}
                        </div>`;
    const descEl = `<p class="custom-modal-desc">${movie.description}</p>`;
    const linksEl = `<div class="custom-modal-links">
                        <button class="btn btn-secondary filter-shortcut" data-movie=${movie.id}>
                            <i class="bi bi-filter"></i> ${translations[language].allShowings}
                        </button>
                        
                        <a href="${show.iframeUrl}" target="_blank" class="btn btn-primary " style="text-decoration: none; color: white;">
                            <i class="bi bi-ticket-perforated-fill"></i> ${translations[language].buyTickets} <br>${dateDisplay}, ${show.time}
                        </a>
                    <div>`;

    modal.innerHTML = `
        <div class="custom-modal-content">
            ${closeEl}
            ${posterEl}
            <div class="custom-modal-info">
                <h2>${movie.title}</h2>
                ${attributesEl}
                ${descEl}
                ${linksEl}
            </div>
        </div>
    `;
    // if were in portrait mode/mobile, we need to alter the modal structure/layout
    if (window.innerWidth < window.innerHeight) {
        modal.innerHTML = `
            <div class="custom-modal-content">
                ${closeEl}
                <div class="custom-modal-info">
                    <div class="custom-modal-mobile-container">
                        <div class="custom-modal-poster-and-attributes">
                            ${posterEl}
                            <div class="custom-modal-attributes-wrapper">
                                <h2>${movie.title}</h2>
                                ${attributesEl}
                            </div>
                        </div>
                    </div>
                    ${descEl}
                    ${linksEl}
                </div>
            </div>
        `;
    } 

    // maybe add in "more info" section
    // <h3 class="custom-modal-actors"><i class="bi bi-person me-2"></i>${movie.actors.join(', ')}</h3>
    // <h3 class="custom-modal-release"><i class="bi bi-calendar2 me-2"></i>${movie.releaseDate}</h3>
    document.body.appendChild(modal);

    // Push a new state to the history
    history.pushState({ modalOpen: true }, '', '');

    // Function to close the modal
    const closeModal = function() {
        modal.remove();
        // Remove the popstate listener
        window.removeEventListener('popstate', onPopState);
    };

    // Listen for the popstate event
    const onPopState = function(event) {
        if (event.state && event.state.modalOpen) {
            closeModal();
        }
    };
    window.addEventListener('popstate', onPopState);

    // Close button event listener
    const closeButton = modal.querySelector('.custom-modal-close');
    closeButton.addEventListener('click', function() {
        closeModal();
        // Go back to the previous state
        history.back();
    });

    const filterShortcut = modal.querySelector('.filter-shortcut');
    filterShortcut.addEventListener('click', function() {
        document.getElementById('movie-view-btn').click();
        document.getElementById('movie-dropdown').value = movie.id;
        enableOmduChecker(movie.attributes);
        document.getElementById('filter-view-btn').click();
        modal.remove();
    });
}

// OPTIMIZED //
function mergeScrolling() {
    // when one timeline is scrolled, all other timelines should scroll as well, only grouped by date and room
    let timelineContainers = getTimelineContainersPerView(currentView);

    timelineContainers.forEach(container => {
        container.addEventListener('scroll', function() {
            const scrollLeft = this.scrollLeft;
            timelineContainers.forEach(otherContainer => {
                if (otherContainer !== this) {
                    otherContainer.scrollLeft = scrollLeft;
                }
            });
        });
    });
}


function calculateTimePercentage(time) {
    // for a given time in HH:MM format, calculate the percentage of the way through START_HOUR to (START_HOUR + TOTAL_HOURS)
    const totalMinutes = 60 * TOTAL_HOURS; // Total minutes in the timescale
    const [hours, minutes] = time.split(':').map(Number);
    let currentMinutes = hours * 60 + minutes; 
    
    // Adjust for times that span into the next day
    if (hours < START_HOUR) {
        currentMinutes += 24 * 60; // Add 24 hours in minutes
    }
    
    const offset = currentMinutes - START_HOUR * 60;
    const percentage = (offset / totalMinutes) * 100;
    return percentage;
}


function calculateEndTime(startTime, duration) {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const movieDuration = parseInt(duration.split(' ')[0], 10);
    const endTime = new Date();
    endTime.setHours(startHours, startMinutes + movieDuration);
    const endHours = endTime.getHours().toString().padStart(2, '0');
    const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
    return `${endHours}:${endMinutes}`;
}

function updateCurrentTimeLine() {
    let { currentTimeLines, currentTimeText } = getCurrentTimeElements(currentView);

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Check if we should show the time indicator
    const shouldShowIndicator = (
        firstDate === TODAY_FORMATTED && // Is the first visible date today?
        hours >= START_HOUR && // Is current time within display hours?
        hours < (START_HOUR + TOTAL_HOURS) &&
        (currentView === 'room' || currentView === 'filter' || globalDayIndex === 0) // Show in room view or if today is selected in date view
    );

    const left = calculateTimePercentage(`${hours}:${minutes}`);
    const percentage = left + '%';

    // Update visibility and position
    Object.values(currentTimeLines).forEach(line => {
        if (line) {
            line.style.display = shouldShowIndicator ? 'block' : 'none';
            line.style.left = percentage;
        }
    });

    if (currentTimeText) {
        currentTimeText.style.display = shouldShowIndicator ? 'block' : 'none';
        currentTimeText.style.left = percentage;
    }
}




function drawHourlyLines(schedule, plotText = false) {
    // plots horizontal lines for each hour from START_HOUR to (START_HOUR + TOTAL_HOURS)
    const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);
    
    hours.forEach(hour => {
        const percentage = calculateTimePercentage(`${hour}:00`);
        
        // text if it's the first or eighth element
        if (plotText) {
            const timeScale = document.createElement('div');
            timeScale.classList.add('time-scale-text');
            timeScale.textContent = `${hour % 24}:00`;
            timeScale.style.left = percentage + '%';
            schedule.querySelector('.timeline-content').appendChild(timeScale);
        }

        // for all timelines, create the time scale div which is a line that is vertically centered and spans the height of the timeline
        const timeScaleLine = document.createElement('div');
        timeScaleLine.classList.add('time-scale');
        timeScaleLine.style.left = percentage + '%';
        schedule.querySelector('.timeline-content').appendChild(timeScaleLine);
    });

}

// Getter and Setter functions
function getTimelineContentsPerView(view) {
    switch (view) {
        case 'room':
            return Array.from(ROOM_VIEW.querySelectorAll('.timeline-content'));
        case 'date':
            return Array.from(DATE_VIEW.querySelectorAll('.timeline-content'));
        case 'filter':
            return Array.from(FILTER_VIEW.querySelectorAll('.timeline-content'));
        default:
            return [];
    }
}

function getTimelineContainersPerView(view) {
    switch (view) {
        case 'room':
            return Array.from(ROOM_VIEW.querySelectorAll('.timeline-container'));
        case 'date':
            return Array.from(DATE_VIEW.querySelectorAll('.timeline-container'));
        case 'filter':
            return Array.from(FILTER_VIEW.querySelectorAll('.timeline-container'));
        default:
            return [];
    }
}

function getCurrentTimeElements(view) {
    switch (view) {
        case 'room':
            return {
                currentTimeLines: {line: ROOM_VIEW.querySelector('.current-time')},
                currentTimeText: ROOM_VIEW.querySelector('.current-time-text')
            };
        case 'date':
            return {
                currentTimeLines: DATE_VIEW.querySelectorAll('.current-time'),
                currentTimeText: DATE_VIEW.querySelector('.current-time-text')
            };
        case 'filter':
            return {
                currentTimeLines: FILTER_VIEW.querySelectorAll('.current-time'),
                currentTimeText: FILTER_VIEW.querySelector('.current-time-text')
            };
        default:
            return {};
    }
}

function getTheaters() {
    return {
        "Saal Tarantino": document.getElementById('saal-tarantino'),
        "Saal Spielberg": document.getElementById('saal-spielberg'),
        "Saal Kubrick": document.getElementById('saal-kubrick'),
        "Saal Almodóvar": document.getElementById('saal-almodovar'),
        "Saal Arsenal": document.getElementById('saal-arsenal'),
        "Saal Coppola": document.getElementById('saal-coppola'),
        "Atelier": document.getElementById('atelier'),
    };
}
