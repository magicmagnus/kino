// Variables
let globalDayIndex = 0;
let currentView = 'date';

const today = new Date();
const todayYear = today.getFullYear();
const todayMonth = today.getMonth() + 1;
const todayDay = today.getDate();
const formattedToday = `${todayYear}-${todayMonth}-${todayDay}`;
let firstDate = formattedToday; // temporarily set to today, could be changed later
const theaters = getTheaters();

const START_HOUR = 9; // Start hour for the timescale
const TOTAL_HOURS = 16; // Total hours for the timescale

// Modify your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {

    handleThemeChange();

    updateViewDisplay();

    // Functions to initialize the page
   
    initializeDateView();

    plotTimeScale();

    updateCurrentTimeLine();
    setInterval(updateCurrentTimeLine, 60000);

    // Scroll to the current time after the page has loaded and timelines have been initialized
    scrollToCurrentTime();
});

function updateViewDisplay() {
    // switch from date view to room view and vice versa
    document.getElementById('view-toggle').addEventListener('click', function () {
        currentView = currentView === 'date' ? 'room' : 'date';


        this.innerHTML = currentView === 'date' ? `<i id="view-toggle-icon" class="bi bi-film"></i> Saal Ansicht`
            : `<i id="view-toggle-icon" class="bi bi-calendar3"></i> Tages Ansicht`;



        // Toggle visibility of views
        const dateView = document.getElementById('date-view');
        const roomView = document.getElementById('room-view');

        if (currentView === 'date') {
            dateView.style.display = 'block';
            roomView.style.display = 'none';

            initializeDateView();
        } else {
            dateView.style.display = 'none';
            roomView.style.display = 'block';

            initializeRoomView();

        }
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

    // fix the scrolling of all timelines to each other
    mergeScrolling();
    //timelineSync.setView(currentView);

    // Create date buttons
    for (let i = 0; i < 9; i++) {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary', 'me-2');
        const date = new Date(today);
        date.setDate(todayDay + i);

        if (i === 0) {
            button.textContent = "Heute";
        } else {
            const options = { weekday: 'short', day: 'numeric', month: 'numeric' };
            button.textContent = date.toLocaleDateString('de-DE', options);
        }

        setupDateButton(button, date, i);
        buttonContainer.appendChild(button);

        // Activate first button by default
        if (i === 0) {
            button.click();
        }
    }
}

// for date view
function setupDateButton(button, date, dayIndex) {
    button.addEventListener('click', () => {
        setGlobalDayIndex(dayIndex);
        clearSchedule();
        loadScheduleForDayIndex(date, dayIndex);
        document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    });
}

// for date view
function loadScheduleForDayIndex(date, dayIndex) {
    // Format the date to match JSON
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month}-${day}`;

    // only show and update the current time line if it is the first day
    if (dayIndex === 0) {
        updateCurrentTimeLine();
    } else {
        hideCurrentTimeLine();
    }

    // Fetch movie data from movie_data.json
    fetch('movie_data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(movie => {
                const showtimes = movie.showtimes.find(show => show.date === formattedDate);
                if (showtimes) {
                    showtimes.shows.forEach(show => {
                        // console.log("show.theater: " + show.theater);
                        theaters[show.theater].appendChild(createMovieBlock(movie, show, date));

                    });
                }
            });
        });
}

// for date view
function setGlobalDayIndex(index) {
    globalDayIndex = index;
}

// for date view
function clearSchedule() {
    document.querySelectorAll('.movie-block').forEach(block => block.remove());
}

// for date view
function hideCurrentTimeLine() {
    document.querySelectorAll('.current-time').forEach(line => line.style.display = 'none');
    document.querySelectorAll('.current-time-text').forEach(text => text.style.display = 'none');
}
// END OF DATE VIEW FUNCTIONS #####################################################################


// ROOM VIEW FUNCTIONS #####################################################################
// for room view
function initializeRoomView() {
    // Clear the date buttons 
    const buttonContainer = document.querySelector('.date-buttons-container');
    buttonContainer.innerHTML = '';


    // Create room buttons
    Object.keys(theaters).forEach((theater, index) => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary', 'me-2');
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
        document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
    });
}

// for room view
function loadScheduleForRoom(theater) {
    const roomView = document.getElementById('room-view');
    roomView.innerHTML = '';
    
    fetch("movie_data.json")
        .then((response) => response.json())
        .then((data) => {
            const dates = new Set();
            data.forEach((movie) => {
                movie.showtimes.forEach((showtime) => {
                    if (showtime.shows.some((show) => show.theater === theater)) {
                        dates.add(showtime.date);
                    }
                });
            });

            let sortedDates = Array.from(dates);
            sortedDates.sort((a, b) => new Date(a) - new Date(b));
            sortedDates = sortedDates.slice(sortedDates.indexOf(formattedToday));

            // Reset firstDate when loading room schedule
            firstDate = sortedDates[0];
            
            // Reset globalDayIndex based on firstDate
            globalDayIndex = firstDate === formattedToday ? 0 : -1;

            sortedDates.forEach((date, index) => {
                const dateObj = new Date(date);
                const schedule = createDateSchedule(date, dateObj, index === 0);
                roomView.appendChild(schedule);
                loadMoviesForDateAndTheater(data, date, theater);
            });
            
            mergeScrolling();
            plotTimeScale();
            // Force update of time indicator after view change
            updateCurrentTimeLine();
        });
}

function removeDatesfromArray(date, array) {
    // look for the date in the array and slice it, then return the last part of the array
    const index = array.indexOf(date);
    if (index > -1) {
        return array.slice(index);
    }
    return array;
}

// for room view OPTIMIZED
function createDateSchedule(date, dateObj, isFirst = false) {
    // for each date in the room view, create a schedule div
    const schedule = document.createElement('div');
    schedule.classList.add('schedule');
    if (isFirst) {
        schedule.id = 'first-schedule';
    }
    
    const options = { weekday: 'short', day: 'numeric', month: 'numeric' };
    const dateDisplay = dateObj.toLocaleDateString('de-DE', options);
    
    schedule.innerHTML = `
        ${isFirst ? `<div class="schedule-name" id="first-schedule-name">` : `<div class="schedule-name">`}
            <h5>${dateDisplay}</h5>
            ${isFirst ? `<div class="fade-in" id="first-fade-in"></div>` : ''}
            <div class="fade-in"></div>
        </div>
        ${isFirst ? `<div class="timeline-container" id="first-timeline-container">` : `<div class="timeline-container">`}
            ${isFirst ? `<div class="timeline" id="first-timeline">` : `<div class="timeline">`}
                <div class="timeline-content" id="timeline-${date}">
                    ${isFirst ? `<div class="current-time" id="current-time-room"></div>` : ''}
                    ${isFirst ? `<div class="current-time-text" id="current-time-text-room">Heute</div>` : ''}
                </div>
            </div>
        </div>
    `;

    return schedule;
}

// for room view
function loadMoviesForDateAndTheater(data, date, theater) {
    const timelineContent = document.getElementById(`timeline-${date}`);
    
    // only show and update the current time line if it is the upper most timeline
    if (date === firstDate) {
        updateCurrentTimeLine();
    }

    data.forEach(movie => {
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
    movieBlock.style.left = `${calculateLeft(show.time)}%`;
    
    
    const endTime = calculateEndTime(show.time, movie.duration);
    const right = calculateLeft(endTime);
    movieBlock.style.width = `${right - calculateLeft(show.time)}%`;

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
                ${show.attributes[1] ? `<div class="omdu"><i class="bi bi-translate me-1"></i>${show.attributes[1]}</div>` : ''}
                    <div class="show-time">${show.time} - ${endTime}</div>
                    
                </div>
            </div>
        </div>
    `;
    
    

    //show.attributes[1] ? (movieBlock.style.backgroundColor = "#9eeaf9") : null;
    movie.duration.split(' ')[0] > 260 ? (movieBlock.style.zIndex = 1) : null;
    movie.title.length >= 35 ? (movieBlock.style.fontSize = "0.9rem") : (movieBlock.style.fontSize = "1.1rem");
    if (movie.title.length >= 35) {
        const fontSize = Math.max(1.0 - (movie.title.length - 35) * 0.007, 0.7); // Adjust the decrement as needed
        movieBlock.style.fontSize = fontSize + 'rem';
        // and reduce the line height as well
        movieBlock.style.lineHeight = '1.0';
    } else {
        movieBlock.style.fontSize = "1.1rem";
        movieBlock.style.lineHeight = '1.0';
    }
    // console.log(movie.title + " " + movie.title.length);

    //onclick event for movie block, get the link from show.iframeUrl and open it in a new tab
    movieBlock.addEventListener('click', function() {
        //window.open(show.iframeUrl, '_blank');

        // instead of opening the link in a new tab, open it in a modal, like a card
        createMovieCard(movie, show, endTime, date);
    });
    
    
    // console.log(movieBlock);

    return movieBlock;
}

function createMovieCard(movie, show, endTime, date) {
    // onclick on the movie block, create a modal card with the movie details, like the title, poster, description, etc.
    // the card should have a close button, and a link to the movie trailer and a link tti the iframeUrl
    // were gonna fo the full layout of the card in the css file, but here we need:
    // - a close button that closes the card
    // - on the top left, the movie poster
    // - beside the poster, [the movie title and under that the show time]
    // - under the title, still besides the postrt, the movie description
    // - under the description, a link to the movie trailer
    // - under the trailer, a link to the iframeUrl
    // - the card should be centered on the screen, but not full screen
    // - the card should have a shadow and a border
    
    
    const modal = document.createElement('div');
    let movieDuration = parseInt(movie.duration.split(' ')[0], 10);
    const dateDisplay = new Date(date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'numeric' });
    // movie dureation convert to X hours and Y minutes
    let movieDurationHours = Math.floor(movieDuration / 60);
    let movieDurationMinutes = movieDuration % 60;
    // if the movie duration is less than 60 minutes, we dont want to display 0 hours
    if (movieDurationHours === 0) {
        movieDuration = `${movieDurationMinutes} Minuten`;
    } else if (movieDurationHours === 1) {
        movieDuration = `${movieDurationHours} Stunde, ${movieDurationMinutes} Minuten`;
    } else if (movieDurationMinutes === 1) {
        movieDuration = `${movieDurationHours} Stunden, ${movieDurationMinutes} Minute`;
    } else {
        movieDuration = `${movieDurationHours} Stunden, ${movieDurationMinutes} Minuten`;
    }
    modal.classList.add('custom-modal');


    // check the current theme for settinng the button colors
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const buttonClass = currentTheme === 'dark' ? 'btn-close btn-close-white' : 'btn-close';
    const closeEl = `<span class="custom-modal-close">
                        <button type="button" class="${buttonClass}" aria-label="Close"></button>
                    </span>`;
    const posterEl = `<img src="${movie.posterUrl}" alt="${movie.title} poster" class="custom-modal-poster">`;
    const attributesEl = `<div class="custom-modal-attributes">
                            <h3 class="custom-modal-time"><i class="bi bi-clock me-2"></i>${movieDuration}</h3>
                            <h3 class="custom-modal-genre"><i class="bi bi-tags me-2"></i>${movie.genre}</h3>
                            <h3 class="custom-modal-fsk"><i class="bi bi-exclamation-circle me-2"></i>FSK ${movie.fsk}</h3>
                            ${show.attributes[1]? `<h3 class="custom-modal-omdu"><i class="bi bi-translate me-2"></i>${show.attributes[1]}</h3>` : ''}
                        </div>`;
    const descEl = `<p class="custom-modal-desc">${movie.description}</p>`;
    const linksEl = `<div class="custom-modal-links">
                        ${movie.trailerUrl != "Unknown Trailer URL" ? `<a href="${movie.trailerUrl}" target="_blank" class="btn btn-secondary " style="text-decoration: none; color: white;">
                            <i class="bi bi-play-circle"></i> Trailer ansehen
                        </a>` : ''}
                        <a href="${show.iframeUrl}" target="_blank" class="btn btn-primary " style="text-decoration: none; color: white;">
                            <i class="bi bi-ticket-perforated-fill"></i> Karten kaufen für <br>${dateDisplay}, ${show.time}
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
    console.log(modal);

    const closeButton = modal.querySelector('.custom-modal-close');
    closeButton.addEventListener('click', function() {  
        modal.remove();
    });
}

// OPTIMIZED //
function mergeScrolling() {
    // when one timeline is scrolled, all other timelines should scroll as well, only grouped by date and room
    let timelineContainers = getTimelineContainersPerView(currentView);

    // console.log("mergeScrolling:")
    // console.log(timelineContainers);

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


function calculateLeft(time) {
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

// Modify the updateCurrentTimeLine function
function updateCurrentTimeLine() {
    let currentTimeLines = {
        currTimeline1: document.getElementById('current-time-line-1'),
        currTimeline2: document.getElementById('current-time-line-2'),
        currTimeline3: document.getElementById('current-time-line-3'),
        currTimeline4: document.getElementById('current-time-line-4'),
        currTimeline5: document.getElementById('current-time-line-5'),
        currTimeline6: document.getElementById('current-time-line-6'),
        currTimeline7: document.getElementById('current-time-line-7'),
    };
    let currentTimeText = document.getElementById('current-time-text');

    if (currentView === 'room') {
        currentTimeLines = {
            currTimeline1: document.getElementById('current-time-room'),
        };
        currentTimeText = document.getElementById('current-time-text-room');
    }

    // Early return if elements aren't found
    if (!Object.values(currentTimeLines).some(line => line) || !currentTimeText) {
        return;
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Check if we should show the time indicator
    const shouldShowIndicator = (
        firstDate === formattedToday && // Is the first visible date today?
        hours >= START_HOUR && // Is current time within display hours?
        hours < (START_HOUR + TOTAL_HOURS) &&
        (currentView === 'room' || globalDayIndex === 0) // Show in room view or if today is selected in date view
    );

    const left = calculateLeft(`${hours}:${minutes}`);
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
        currentTimeText.textContent = currentView === 'date' ? 'Jetzt' : 'Heute';
    }
}

function scrollToCurrentTime() {
    const currentTimeText = document.querySelector('.current-time-text');
    if (!currentTimeText) return;

    const timelineContainer = currentTimeText.closest('.timeline-container');
    if (!timelineContainer) return;

    const containerWidth = timelineContainer.clientWidth;
    const currentTimeTextLeft = currentTimeText.offsetLeft;
    const scrollPosition = currentTimeTextLeft - (containerWidth / 2) + (currentTimeText.clientWidth / 2);

    timelineContainer.scrollLeft = scrollPosition;
}

function plotTimeScale() {
    // plots horizontal lines for each hour from START_HOUR to (START_HOUR + TOTAL_HOURS)
    const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR);

    const timelineContents = getTimelineContentsPerView(currentView);
  
    timelineContents.forEach((content, index) => {
        hours.forEach(hour => {
            const percentage = calculateLeft(`${hour}:00`);
            
            // text if it's the first or eighth element
            if (index === 0 || index === 7) {
                const timeScale = document.createElement('div');
                timeScale.classList.add('time-scale-text');
                timeScale.textContent = `${hour % 24}:00`;
                timeScale.style.left = percentage + '%';
                
                content.appendChild(timeScale);
            }
            
            // for all timelines, create the time scale div which is a line that is vertically centered and spans the height of the timeline
            const timeScale = document.createElement('div');
            timeScale.classList.add('time-scale');
            timeScale.style.left = percentage + '%';
            
            content.appendChild(timeScale);
        });
    });
}

// Getter and Setter functions
function getTimelineContentsPerView(view) {
    return view === 'date' ? (Array.from(document.querySelectorAll('.timeline-content')).slice(0, 7)) 
                            : (Array.from(document.querySelectorAll('.timeline-content')).slice(7)); 
}

function getTimelineContainersPerView(view) {
    return view === 'date' ? (Array.from(document.querySelectorAll('.timeline-container')).slice(0, 7)) 
                            : (Array.from(document.querySelectorAll('.timeline-container')).slice(7));
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

class TimelineSync {
    constructor() {
        this.currentView = 'date';
        this.isScrolling = false;
        this.lastScrollTime = 0;
        this.scrollThrottle = 1; // For 120Hz support
        this.currentTimelines = [];
        this.rafId = null;
    }
    
    initCurrentView() {
        this.removeEventListeners();
        this.currentTimelines = getTimelineContainersPerView(this.currentView);
        console.log('Current timelines:', this.currentTimelines);
        
        this.currentTimelines.forEach(container => {
            // Main scroll handler
            container.addEventListener('scroll', (e) => this.handleScroll(e), { passive: true });
        });
        console.log('Event listeners added');
    }
    
    handleScroll(event) {
        const now = Date.now();
        if (this.isScrolling || now - this.lastScrollTime < this.scrollThrottle) return;
        
        this.isScrolling = true;
        this.lastScrollTime = now;
        
        // Cancel any pending animation frame
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        const sourceContainer = event.target;
        const scrollLeft = sourceContainer.scrollLeft;
        
        this.rafId = requestAnimationFrame(() => {
            this.currentTimelines.forEach(container => {
                if (container !== sourceContainer) {
                    container.scrollLeft = scrollLeft;
                }
            });
            
            this.isScrolling = false;
            this.rafId = null;
        });
    }
    
    removeEventListeners() {
        if (this.currentTimelines.length) {
            this.currentTimelines.forEach(container => {
                const newContainer = container.cloneNode(true);
                container.parentNode.replaceChild(newContainer, container);
            });
        }
        
        // Cancel any pending animation frame when removing listeners
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
    
    setView(view) {
        this.currentView = view;
        console.log('Current view:', this.currentView);
        this.initCurrentView();
    }
}

const timelineSync = new TimelineSync();



function adjustTitleFontSize(movieBlock) {
    const titleElement = movieBlock.querySelector('.strong');
    
    // Set an initial font size and decrease if overflowing
    titleElement.style.fontSize = ''; // Reset previous styles

    // Reduce font size until the title fits within its wrapper
    while (titleWrapper.scrollWidth > titleWrapper.clientWidth && fontSize > 10) { // 10px as minimum font size for legibility
        console.log('Title overflow:', titleElement.textContent);
        fontSize -= 1; // Adjust the decrement as needed
        titleElement.style.fontSize = fontSize + 'px';
    }
}