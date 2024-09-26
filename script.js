const movieDataUrl = './movie_data.json'; // Path to your JSON file

// Fetch and display current date
document.querySelector('.current-date').textContent = new Date().toLocaleDateString();

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
    button.textContent = date.toISOString().split('T')[0]; // YYYY-MM-DD
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
                column.innerHTML = `<h2>${theater}</h2>`;
                scheduleGrid.appendChild(column);

                // Check showtimes for the selected date and theater
                let theaterHasShows = false;
                data.forEach(movie => {
                    movie.showtimes.forEach(showtime => {
                        if (showtime.date === selectedDate) {
                            console.log(`Date match found: ${selectedDate}`);
                            showtime.shows.forEach(show => {
                                if (show.theater === theater) {
                                    console.log(`Found show for theater ${theater}: ${movie.title} at ${show.time}`);
                                    const movieBlock = document.createElement('div');
                                    movieBlock.classList.add('movie-block');
                                    const endTime = calculateEndTime(show.time, movie.duration);
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
                    console.log(`No shows for theater ${theater} on ${selectedDate}`);
                    column.innerHTML += `<p>No shows for today.</p>`;
                }
            });
        })
        .catch(error => {
            console.error('Error loading movie data:', error);
        });
}

// Load the schedule for today initially
loadSchedule(today.toISOString().split('T')[0]);
