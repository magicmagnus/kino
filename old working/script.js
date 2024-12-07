const movieDataUrl = '../movie_data.json'; // Path to your JSON file

// Fetch and display current date
document.querySelector('.current-date').textContent = new Date().toLocaleDateString();

// Function to format dates to YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0]; // This ensures date is in YYYY-MM-DD format
}

// Function to add leading zeros to months and days for consistent comparison
function normalizeDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`; // Ensure both month and day have leading zeros
}

// Convert time (HH:MM) to a number of minutes since 12:00
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours * 60) + minutes;

    // Normalize to a 12:00 start time (12 * 60 = 720 minutes)
    const minutesSinceStart = totalMinutes - (12 * 60); // Start at 12:00 (720 minutes)
    return minutesSinceStart;
}

// Calculate block height based on movie duration
function durationToMinutes(duration) {
    return parseInt(duration.split(' ')[0]);
}


// Function to calculate the end time of a movie based on start time + duration
function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const durationMinutes = parseInt(duration.split(' ')[0]);
    const end = new Date();
    end.setHours(hours, minutes + durationMinutes);
    return end.toTimeString().slice(0, 5); // Return in HH:MM format
}

// Create day buttons for the next 7 days
const dayButtons = document.querySelector('.day-buttons');
const today = new Date();
for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const button = document.createElement('button');
    button.textContent = formatDate(date); // Format date to YYYY-MM-DD
    button.addEventListener('click', () => loadSchedule(button.textContent));
    if (i === 0) button.classList.add('active'); // Mark today as active initially
    dayButtons.appendChild(button);
}

// Load and display the schedule for a given day
function loadSchedule(selectedDate) {
    // Highlight the active button
    document.querySelectorAll('.day-buttons button').forEach(button => {
        button.classList.remove('active');
        if (button.textContent === selectedDate) button.classList.add('active');
    });

    // Fetch movie data and display the schedule
    fetch(movieDataUrl)
        .then(response => response.json())
        .then(data => {
            const scheduleGrid = document.querySelector('.schedule-grid');
            scheduleGrid.innerHTML = ''; // Clear previous schedule

            // Create columns for each theater room
            const theaters = ["Saal Tarantino", "Saal Spielberg", "Saal Kubrick", "Saal Almodóvar", "Saal Arsenal", "Saal Coppola", "Atelier"];
            theaters.forEach(theater => {
                const column = document.createElement('div');
                column.classList.add('column');
                column.innerHTML = `
                    <div class="theater-header">
                        <h2>${theater}</h2>
                    </div>
                `;
                scheduleGrid.appendChild(column);

                // Check showtimes for the selected date and theater
                let theaterHasShows = false;
                data.forEach(movie => {
                    movie.showtimes.forEach(showtime => {
                        if (normalizeDate(showtime.date) === selectedDate) {
                            showtime.shows.forEach(show => {
                                if (show.theater === theater) {
                                    const movieBlock = document.createElement('div');
                                    movieBlock.classList.add('movie-block');

                                    // Calculate top position based on start time
                                    const startTimeInMinutes = timeToMinutes(show.time);
                                    const durationInMinutes = durationToMinutes(movie.duration);
                                    const endTime = calculateEndTime(show.time, movie.duration);

                                    // Set block's position and height based on time and duration
                                    const totalMinutesInDay = (13 * 60); // 12:00 to 01:00 is 13 hours or 780 minutes
                                    const topPercentage = (startTimeInMinutes / totalMinutesInDay) * 100;
                                    const heightPercentage = (durationInMinutes / totalMinutesInDay) * 100;

                                    movieBlock.style.position = 'absolute';
                                    movieBlock.style.top = `${topPercentage}%`;  // Position based on start time
                                    movieBlock.style.height = `${heightPercentage}%`;  // Height based on movie duration

                                    // Movie block content
                                    movieBlock.innerHTML = `
                                        <h3>${movie.title} (${show.time} - ${endTime})</h3>
                                        <p>${show.attributes.join(', ')}</p>
                                    `;
                                    column.appendChild(movieBlock);
                                    theaterHasShows = true;
                                }
                            });
                        }
                    });
                });

                // If the theater has no shows for that day, display a message
                if (!theaterHasShows) {
                    column.innerHTML += `<p>No shows for today.</p>`;
                }
            });
        })
        .catch(error => {
            console.error('Error loading movie data:', error);
        });
}




// Load the schedule for today initially
loadSchedule(formatDate(today));
