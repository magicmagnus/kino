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

// Modify your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // Add the view toggle handler
    document.getElementById('view-toggle').addEventListener('click', function() {
        currentView = currentView === 'date' ? 'room' : 'date';
        this.textContent = currentView === 'date' ? 'Room View' : 'Date View';
        
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

    // Functions to initialize the page
   
    initializeDateView();

    plotTimeScale();

    //const timelineSync = new TimelineSync();
    
    updateCurrentTimeLine();
    setInterval(updateCurrentTimeLine, 60000);
});

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
            button.textContent = "Today";
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
                        theaters[show.theater].appendChild(createMovieBlock(movie, show));

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
    // Clear the room view of any existing schedule
    roomView.innerHTML = '';
    
    fetch("movie_data.json")
        .then((response) => response.json())
        .then((data) => {
            // Get all unique dates for this theater
            const dates = new Set();
            data.forEach((movie) => {
                movie.showtimes.forEach((showtime) => {
                    if (showtime.shows.some((show) => show.theater === theater)) {
                        dates.add(showtime.date);
                    }
                });
            });

            // Sort dates and remove dates that are before today
            let sortedDates = Array.from(dates);
            sortedDates.sort((a, b) => new Date(a) - new Date(b));
            sortedDates = sortedDates.slice(sortedDates.indexOf(formattedToday));

            // the first date could be a date in the future
            firstDate = sortedDates[0];
            
            // Create timeline for each date
            sortedDates.forEach((date, index) => {
                const dateObj = new Date(date);
                const schedule = createDateSchedule(date, dateObj, index === 0); // Pass true for first schedule
                roomView.appendChild(schedule);

                // Load movies for this date and theater
                loadMoviesForDateAndTheater(data, date, theater);
            });
            
            // only after all schedules have been created, merge scrolling and plot time scale
            mergeScrolling();
            // timelineSync.setView(currentView);
            plotTimeScale();

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
                    ${isFirst ? `<div class="current-time-text" id="current-time-text-room">Today</div>` : ''}
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

                    timelineContent.appendChild(createMovieBlock(movie, show));
                }
            });
        }
    });
    
    
}
// END OF ROOM VIEW FUNCTIONS #####################################################################

function createMovieBlock(movie, show) {

    const movieBlock = document.createElement('div');
    movieBlock.classList.add('movie-block');
    movieBlock.style.left = `${calculateLeft(show.time)}%`;
    
    const endTime = calculateEndTime(show.time, movie.duration);
    const right = calculateLeft(endTime);
    movieBlock.style.width = `${right - calculateLeft(show.time)}%`;

    
    const posterUrl = movie.posterUrl == null ? "placeholder.jpg" : movie.posterUrl;
    

    movieBlock.innerHTML = `
        <div class="movie-block-inner">
            <img src="${posterUrl}" alt="${movie.title} poster">
            <div class="movie-block-info">
                <strong>${movie.title}</strong>
                <div>
                    <div class="show-time">${show.time} - ${endTime}</div>
                    ${show.attributes[1] ? `<div class="omdu">${show.attributes[1]}</div>` : ''}
                </div>
            </div>
        </div>
    `;

    show.attributes[1] ? (movieBlock.style.backgroundColor = "#9eeaf9") : null;
    movie.duration.split(' ')[0] > 220 ? (movieBlock.style.zIndex = 1) : null;

    //onclick event for movie block, get the link from show.iframeUrl and open it in a new tab
    movieBlock.addEventListener('click', function() {
        //window.open(show.iframeUrl, '_blank');

        // instead of opening the link in a new tab, open it in a modal, like a card
        createMovieCard(movie, show, endTime);
    });
    
    
    // console.log(movieBlock);

    return movieBlock;
}

function createMovieCard(movie, show, endTime) {
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
    modal.classList.add('custom-modal');
    // if were in portrait mode/mobile, we need to alter the modal structure/layaout
    modal.innerHTML = `
        <div class="custom-modal-content">
            <span class="custom-modal-close">
                <i class="bi bi-x-lg"></i>
            </span>
            <img src="${movie.posterUrl}" alt="${movie.title} poster" class="custom-modal-poster">
            <div class="custom-modal-info">
                <h2>${movie.title}</h2>
                <div class="custom-modal-attributes">
                    <h3 class="custom-modal-time">${show.time} - ${endTime}</h3>
                    <h3 class="custom-modal-genre">${movie.genre}</h3>
                    <h3 class="custom-modal-fsk">${movie.fsk}</h3>
                    <h3 class="custom-modal-omdu">${show.attributes[1]? show.attributes[1] : ''}</h3>
                </div>
                <p class="custom-modal-desc">${movie.description}${movie.description}</p>
                <div class="custom-modal-links">
                    <a href="${movie.trailerUrl}" target="_blank" class="btn btn-secondary " style="text-decoration: none; color: white;">
                        <i class="bi bi-play-circle"></i> Trailer ansehen
                    </a>
                    <a href="${show.iframeUrl}" target="_blank" class="btn btn-primary " style="text-decoration: none; color: white;">
                        <i class="bi bi-ticket-perforated-fill"></i> Karten kaufen
                    </a>
                <div>
            </div>
        </div>
    `;
    // if were in portrait mode/mobile, we need to alter the modal structure/layaout
    if (window.innerWidth < window.innerHeight) {
        modal.innerHTML = `
            <div class="custom-modal-content">
                <span class="custom-modal-close">
                    <i class="bi bi-x-lg"></i>
                </span>

                
                <div class="custom-modal-info">
                    <h2>${movie.title}</h2>
                    <div class="custom-modal-mobile-container">
                        <img src="${movie.posterUrl}" alt="${movie.title} poster" class="custom-modal-poster">
                        <div class="custom-modal-attributes">
                            <h3 class="custom-modal-time">${show.time} - ${endTime}</h3>
                            <h3 class="custom-modal-genre">${movie.genre}</h3>
                            <h3 class="custom-modal-fsk">${movie.fsk}</h3>
                            <h3 class="custom-modal-omdu">${show.attributes[1]? show.attributes[1] : ''}</h3>
                        </div>
                    </div>
                    <p class="custom-modal-desc">${movie.description}${movie.description}</p>
                    <div class="custom-modal-links">
                        <a href="${movie.trailerUrl}" target="_blank" class="btn btn-secondary " style="text-decoration: none; color: white;">
                            <i class="bi bi-play-circle"></i> Trailer ansehen
                        </a>
                        <a href="${show.iframeUrl}" target="_blank" class="btn btn-primary " style="text-decoration: none; color: white;">
                            <i class="bi bi-ticket-perforated-fill"></i> Karten kaufen
                        </a>
                    <div>
                </div>
            </div>
        `;
    } 
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
    // for a given time in HH:MM format, calculate the percentage of the way through 12pm to 1am
    const totalMinutes = 60 * 13; // 780 
    const [hours, minutes] = time.split(':').map(Number);
    const currentMinutes = hours * 60 + minutes; 
    const offset = currentMinutes - 12 * 60;
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

    if (globalDayIndex !== 0) {
        return;
    }

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

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    const left = calculateLeft(`${hours}:${minutes}`);
    const percentage = left + '%';


    // only show the current time line if it is between 12pm and 1am
    if (hours < 12 || hours >= 25 || firstDate !== formattedToday ) {
        Object.values(currentTimeLines).forEach(line => {
            line.style.display = 'none';
        });
        currentTimeText.style.display = 'none';
        return;
    }
    


    
    // Update the current time lines
    Object.values(currentTimeLines).forEach(line => {
        line.style.left = percentage;
        line.style.display = 'block';
    });

    // Update the current time text
    currentTimeText.textContent = currentView === 'date' ? 'Now' : 'Today';
    currentTimeText.style.left = percentage;    
    currentTimeText.style.display = 'block';
    
}

function plotTimeScale() {
    // plots horizontal lines for each hour from 12pm to 1am
    // and for the upper most timeline, it also plots the time scale text
    const hours = Array.from({ length: 14 }, (_, i) => i + 12);

    const timelineContents = getTimelineContentsPerView(currentView);
    // console.log("plotTimeScale:");
    // console.log(timelineContents);
  
    //console.log(timelineContents);
    timelineContents.forEach((content, index) => {
        hours.forEach(hour => {
            const percentage = calculateLeft(`${hour}:00`);
            
            // text if it's the first or eighth element
            if (index === 0 || index === 7) {
                const timeScale = document.createElement('div');
                timeScale.classList.add('time-scale-text');
                timeScale.textContent = `${hour % 25}:00`;
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