document.addEventListener('DOMContentLoaded', () => {
    
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
    });

    // Initial load for day 1
    loadScheduleForDay(today, 0);

    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 25, 0, 0, 0);

    console.log(now, start, end);

    // Check if the current time is between 12pm and 1pm
    if (now >= start && now <= end) {
        var currentTimeLine = document.getElementById('current-time-line');

        // Calculate the percentage of the way through the time window
        var percentage = ((now - start) / (end - start)) * 100;

        // Adjust the position of the line
        currentTimeLine.style.left = percentage + '%';

        // Show the line
        currentTimeLine.style.display = 'block';
    }
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

    // // Clear existing schedule
    // Object.values(theaters).forEach(theater => {
    //     theater.innerHTML = '';
    // });

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
                        movieBlock.style.width = `${calculateWidth(movie.duration)}px`;
                        movieBlock.style.left = `${calculateLeft(show.time)}px`;
            
                        // Calculate end time based on start time and duration
                        const endTime = calculateEndTime(show.time, movie.duration);
            
                        // Fetch movie poster
                        $.getJSON("https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=" + movie.title + "&callback=?", function(json) {
                            if (json != "Nothing found.") {
                                const posterUrl = "http://image.tmdb.org/t/p/w500/" + json.results[0].poster_path;

                                // Build movie block HTML
                                movieBlock.innerHTML = `
                                    <div class="movie-block-inner">
                                        <div class="movie-block-info">
                                            <img src="${posterUrl}" alt="${movie.title} poster">
                                            <div>
                                                <p>${show.time} - ${endTime}</p>
                                                <p>${show.attributes.join(', ')}</p>
                                            </div>
                                        </div>
                                        <strong>${movie.title}</strong>
                                    </div>
                                `;
                                theaters[show.theater].appendChild(movieBlock);
                            }
                        });
                    });
                }
            });
        });
}


function calculateWidth(duration) {
    const minutes = parseInt(duration.split(' ')[0], 10);
    return (minutes / 60) * 100;  // Scale width to fit a 100px wide container
}

function calculateLeft(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return ((hours - 12) * 100) + (minutes / 60 * 100);  // Calculate left position based on time
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

