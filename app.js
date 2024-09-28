document.addEventListener('DOMContentLoaded', function() {
    const timelineContainers = document.querySelectorAll('.timeline-container');
    
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

    const dayButtons = document.querySelectorAll('.btn');

    const today = new Date();  // Get current date
    

    // Format buttons with "Today" for the current date, and "Fr., 27.9." for others
    dayButtons.forEach((button, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);  // Calculate date for each button

        // Display "Today" for the first button, otherwise "Fr., 27.9."
        if (index === 0) {
            button.textContent = "Today";
        } else {
            const options = { weekday: 'short', day: 'numeric', month: 'numeric' };
            button.textContent = date.toLocaleDateString('de-DE', options);  // Format like "Fr., 27.9."
        }

        button.addEventListener('click', () => {
            // Create a new date for the day this button represents
            const date = new Date();
            date.setDate(date.getDate() + index);

            // clear existing schedule
            clearSchedule();
    
            // Load the schedule for this day
            loadScheduleForDay(date, index);

            
        });
    });

    // Initial load for day 1
    loadScheduleForDay(today, 0);

    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 25, 0, 0, 0);

    console.log(now, start, end);

    
});

function loadScheduleForDay(date, dayIndex) {
    const theaters = {
        "Saal Tarantino": document.getElementById('saal-tarantino'),
        "Saal Spielberg": document.getElementById('saal-spielberg'),
        "Saal Kubrick": document.getElementById('saal-kubrick'),
        "Saal Almodóvar": document.getElementById('saal-almodovar'),
        "Saal Arsenal": document.getElementById('saal-arsenal'),
        "Saal Coppola": document.getElementById('saal-coppola'),
        "Atelier": document.getElementById('atelier'),
    };

    // Format the date to match JSON
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedDate = `${year}-${month}-${day}`;

    // if the date is today, we need to update the current time line
    if (dayIndex === 0) {
        showCurrentTimeLine(theaters);
    }
    
        

    

    // Fetch movie data from movie_data.json
    fetch('movie_data.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(movie => {
                const showtimes = movie.showtimes.find(show => show.date === formattedDate);
                if (showtimes) {
                    showtimes.shows.forEach(show => {
                        const movieBlock = document.createElement('div');
                        movieBlock.classList.add('movie-block');
                        console.log(movie.title, show.time);
                        // the left position of the movie block is the percentage of the way through the day
                        movieBlock.style.left = `${calculateLeft(show.time)}%`;
                        
                        const endTime = calculateEndTime(show.time, movie.duration);
                        const right = calculateLeft(endTime);
                        movieBlock.style.width = `${right - calculateLeft(show.time)}%`;
            
                        // Fetch movie poster
                        $.getJSON("https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=" + movie.title + "&callback=?", function(json) {
                            if (json != "Nothing found.") {
                                const posterUrl = "http://image.tmdb.org/t/p/w500/" + json.results[0].poster_path;

                                // Build movie block HTML
                                if (posterUrl) {
                                    movieBlock.innerHTML = `
                                        <div class="movie-block-inner">
                                            <img src="${posterUrl}" alt="${movie.title} poster">
                                            <div class="movie-block-info">
                                                <strong>${movie.title}</strong>
                                                <div>
                                                    <div class="show-time">${show.time} - ${endTime}</div>
                                                    ${show.attributes[1] ? `<div class="omdu">OmdU</div>` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                } 
                                
                                if (show.attributes[1] === "OMdU") {
                                    movieBlock.style.backgroundColor = "#9eeaf9";
                                }
                                
                                theaters[show.theater].appendChild(movieBlock);
                            }
                        });
                    });
                }
            });
        });
}

function clearSchedule() {
    const theaters = {
        "Saal Tarantino": document.getElementById('saal-tarantino'),
        "Saal Spielberg": document.getElementById('saal-spielberg'),
        "Saal Kubrick": document.getElementById('saal-kubrick'),
        "Saal Almodóvar": document.getElementById('saal-almodovar'),
        "Saal Arsenal": document.getElementById('saal-arsenal'),
        "Saal Coppola": document.getElementById('saal-coppola'),
        "Atelier": document.getElementById('atelier'),
    };

    // Clear existing schedule
    Object.values(theaters).forEach(theater => {
        // first grab all the movie blocks
        const movieBlocks = theater.querySelectorAll('.movie-block');
        // then remove them all
        movieBlocks.forEach(block => block.remove());

        // then grab all the elements with the class "current-time" and "current-time-text"
        const currentTimeLines = theater.querySelectorAll('.current-time');
        const currentTimeText = theater.querySelectorAll('.current-time-text');
        // then hide them
        currentTimeLines.forEach(line => line.style.display = 'none');
        currentTimeText.forEach(text => text.style.display = 'none');

    });
}

function calculateLeft(time) {
    // the parent container is timeline-content, we need to get its width,
    const container = document.querySelector('.timeline-content');
    const containerWidth = container.offsetWidth;
    console.log("containerWidth: " + containerWidth + "px");
    // the minutes between 12pm and 01pm (next day) are our total minutes, and our timeline from 0 to 100%
    const totalMinutes = 60 * 13; // 780 
    // the current time is our offset
    const [hours, minutes] = time.split(':').map(Number);
    const currentMinutes = hours * 60 + minutes; 
    // to get the current minutes in relation to 12pm, we need to subtract 12pm from the current time
    const offset = currentMinutes - 12 * 60;
    // the percentage of the way through the day is the offset divided by the total minutes
    const percentage = (offset / totalMinutes) * 100;
    console.log("offset: " + offset + " minutes", "percentage: " + percentage + "%");
    // the left position of the movie block is the percentage of the way through the day

    return percentage;


    
    
}


function calculateWidth(duration) {
    

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
    const currentTimeLines = {
        currTimeline1: document.getElementById('current-time-line-1'),
        currTimeline2: document.getElementById('current-time-line-2'),
        currTimeline3: document.getElementById('current-time-line-3'),
        currTimeline4: document.getElementById('current-time-line-4'),
        currTimeline5: document.getElementById('current-time-line-5'),
        currTimeline6: document.getElementById('current-time-line-6'),
        currTimeline7: document.getElementById('current-time-line-7'),
    };

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // only show the current time line if it is between 12pm and 1am
    if (hours < 12 || hours >= 25) {
        Object.values(currentTimeLines).forEach(line => {
            line.style.display = 'none';
        });
        return;
    }

    const left = calculateLeft(`${hours}:${minutes}`);
    const percentage = left + '%';
    
    Object.values(currentTimeLines).forEach(line => {
        line.style.left = percentage;
        line.style.display = 'block';
    });

    // Update the current time text
    const currentTimeText = document.getElementById('current-time-text');
    currentTimeText.textContent = `Now: ${hours}:${minutes}`;
    currentTimeText.style.display = 'block';
    currentTimeText.style.left = percentage;    
    
}

function showCurrentTimeLine(theaters) {    
    Object.values(theaters).forEach(theater => {
        //show the current time line
        const currentTimeLines = theater.querySelectorAll('.current-time');
        const currentTimeText = theater.querySelectorAll('.current-time-text');
        currentTimeLines.forEach(line => line.style.display = 'block');
        currentTimeText.forEach(text => text.style.display = 'block');

    });
}


// Call this function when the page loads
updateCurrentTimeLine();

// And every minute thereafter
setInterval(updateCurrentTimeLine, 60000);