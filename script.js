// web app's Firebase configuration
firebase.initializeApp({
    apiKey: "AIzaSyBur0RoviX8Y-gckEJ7nuKebavXaPLLtoQ",
    authDomain: "event-planner-2b116.firebaseapp.com",
    projectId: "event-planner-2b116",
    storageBucket: "event-planner-2b116.firebasestorage.app",
    messagingSenderId: "175124040884",
    appId: "1:175124040884:web:d4cc7ed283c697416e5be1",
});

const messaging = firebase.messaging();

// DOM Elements
const eventsContainer = document.getElementById('eventsContainer'); // Container for events 
const eventForm = document.getElementById('eventForm'); // Form for adding events 
const eventTitle = document.getElementById('eventTitle'); // Event title input 
const eventDate = document.getElementById('eventDate'); // Event date input 
const eventTime = document.getElementById('eventTime'); // Event time input 
const searchInput = document.getElementById('searchInput'); // Search input field 
const filterSelect = document.getElementById('filterSelect'); // Filter dropdown 

// integrating OpenWeatherMap API
const showWeatherBtn = document.getElementById('showWeatherBtn');
const weatherPopup = document.getElementById('weatherPopup');
const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const cityInput = document.getElementById('cityInput');

// allow city name submission with 'Enter' key
const weatherForm = document.getElementById('weatherForm');

let weatherInterval = null;

// Load events from localStorage or initialize empty array
let events = JSON.parse(localStorage.getItem('myEvents')) || []; // Retrieves stored events or initializes empty array 

// Save events to localStorage
function saveEvents() {
    localStorage.setItem('myEvents', JSON.stringify(events)); // Saves the current events array to localStorage 
}

// Render events to the page
function renderEvents() {
    eventsContainer.innerHTML = ''; // Clears the current events display 

    // Apply search and filter
    const searchTerm = searchInput.value.toLowerCase(); // Gets the search term in lowercase 
    const filter = filterSelect.value; // Gets the selected filter option 

    const filteredEvents = events.filter(e => { // Filters events based on search and filter criteria 
        const matchesSearch = e.title.toLowerCase().includes(searchTerm); // Checks if event title matches search term 
        let matchesFilter = true; // Initializes filter match to true 
        if (filter === 'upcoming') { // If filter is set to upcoming 
            matchesFilter = !e.completed && new Date(`${e.date}T${e.time}`) >= new Date(); // Checks if event is not completed and is in the future 
        } else if (filter === 'completed') { // If filter is set to completed 
            matchesFilter = e.completed; // Checks if event is completed 
        }
        return matchesSearch && matchesFilter; // Returns true if both search and filter criteria are met 
    });

    // Sort events by date and time
    filteredEvents.sort((e, b) => { // Sorts the filtered events 
        const dateA = new Date(`${e.date}T${e.time}`); // Converts event A's date and time to Date object 
        const dateB = new Date(`${b.date}T${b.time}`); // Converts event B's date and time to Date object 
        return dateA - dateB; // Sorts events in ascending order 
    });

    // Render each event
    filteredEvents.forEach((e, i) => { // Iterates over each filtered event 
        const eventIndex = events.indexOf(e); // Original index in the events array 
        const eventItem = document.createElement('li'); // Creates a new list item for the event 
        eventItem.className = `event-item ${e.completed ? 'completed' : ''}`; // Adds classes based on completion status 

        eventItem.innerHTML = `
            <div class="event-header">
                <h3>${e.title}</h3> <!-- Displays the event title  -->
                <div class="event-actions">
                    <button class="complete-btn" onclick="toggleComplete(${eventIndex})" title="${e.completed ? 'Undo' : 'Complete'}">
                        <i class="fas ${e.completed ? 'fa-rotate-left' : 'fa-check'}"></i>
                    </button>
                    
                    <button class="edit-btn" onclick="editEvent(${eventIndex})">
                        <i class="fas fa-pen"></i>
                    </button>
                    
                    <button class="delete-btn" onclick="deleteEvent(${eventIndex})">
                        <i class="fas fa-trash"></i>      
                    </button>
                    
                    <button class="share-btn" onclick="shareEvent(${eventIndex})">
                        <i class="fas fa-share"></i>
                    </button>
                </div>
            </div>
            <div class="event-details">
                📅 ${e.date} ⏰ ${e.time} <!-- Displays event date and time with icons  -->
            </div>
            <span class="share-message" id="shareMsg${eventIndex}">Copied to clipboard!</span> <!-- Message shown after sharing  -->
        `;

        eventsContainer.appendChild(eventItem); // Adds the event item to the container 
    });
}

// Add or Update event
eventForm.addEventListener('submit', function(e) { // Handles form submission 
    e.preventDefault(); // Prevents the default form submission behavior 
    const title = eventTitle.value.trim(); // Gets and trims the event title 
    const date = eventDate.value; // Gets the event date 
    const ttime = eventTime.value; // Gets the event time 

    if (!title || !date || !ttime) { // Checks if all fields are filled 
        alert('Please fill in all fields.'); // Alerts the user to fill all fields 
        return;
    }

    const existingIndex = events.findIndex(e => e.editing); // Finds if an event is being edited 
    if (existingIndex !== -1) {
        // Update existing event
        events[existingIndex] = {
            ...events[existingIndex],
            title: title, // Updates the title 
            date: date, // Updates the date 
            time: ttime, // Updates the time 
            editing: false // Marks the event as not being edited 
        };
    } else {
        // Add new event
        const newEvent = {
            title: title, // Sets the title for the new event 
            date: date, // Sets the date for the new event 
            time: ttime, // Sets the time for the new event 
            completed: false // Initializes the event as not completed 
        };
        events.push(newEvent); // Adds the new event to the events array 
    }

    saveEvents(); // Saves the updated events array to localStorage 
    renderEvents(); // Renders the updated events on the page 
    eventForm.reset(); // Resets the form fields 
});

// Delete event
window.deleteEvent = function(index) { // Function to delete an event 
    if (confirm('Are you sure you want to delete this event?')) { // Confirms deletion with the user 
        events.splice(index, 1); // Removes the event from the array 
        saveEvents(); // Saves the updated events array to localStorage 
        renderEvents(); // Renders the updated events on the page 
    }
};

// Share event: copy details to clipboard
window.shareEvent = function(index) { // Function to share an event 
    const e = events[index]; // Gets the event to share 
    const textToCopy = `${e.title} on ${e.date} at ${e.time}`; // Formats the text to copy 
    navigator.clipboard.writeText(textToCopy).then(() => { // Copies text to clipboard 
        const msgEl = document.getElementById(`shareMsg${index}`); // Gets the share message element 
        msgEl.style.display = 'inline'; // Shows the share message 
        setTimeout(() => {
            msgEl.style.display = 'none';
        }, 2000); // Hides the message after 2 seconds 
    }).catch(err => { // Handles copy failure 
        alert('Failed to copy text: ', err); // Alerts the user if copying fails 
    });
};

// Edit event
window.editEvent = function(index) { // Function to edit an event 
    const e = events[index]; // Gets the event to edit 
    eventTitle.value = e.title; // Populates the title input with existing title 
    eventDate.value = e.date; // Populates the date input with existing date 
    eventTime.value = e.time; // Populates the time input with existing time 
    // Mark this event as being edited
    e.editing = true; // Sets the editing flag to true 
    saveEvents(); // Saves the updated events array to localStorage 
    renderEvents(); // Renders the updated events on the page 
};

// Toggle complete status
window.toggleComplete = function(index) { // Function to toggle event completion 
    events[index].completed = !events[index].completed; // Toggles the completed status 
    saveEvents(); // Saves the updated events array to localStorage 
    renderEvents(); // Renders the updated events on the page 
};

// Search events
searchInput.addEventListener('input', renderEvents); // Re-renders events on search input change 

// Filter events
filterSelect.addEventListener('change', renderEvents); // Re-renders events on filter selection change 

// Notifications for upcoming events
// function checkNotifications() { // Function to check and send notifications 
//     if (Notification.permission !== 'granted') { // Checks if notification permission is granted 
//         Notification.requestPermission(); // Requests notification permission if not granted 
//     }

//     const nnot = new Date(); // Current date and time 
//     events.forEach(e => { // Iterates over each event to check for notifications 
//         const eventTime = new Date(`${e.date}T${e.time}`); // Event's date and time as Date object 
//         const timeDiff = eventTime - nnot; // Difference between event time and current time 
//         if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000 && !e.notified && !e.completed) { // Checks if event is within 15 minutes and not notified or completed 
//             new Notification('Event Reminder', { // Creates a new notification 
//                 body: `${e.title} at ${e.time} on ${e.date}` // Notification message 
//             });
//             e.notified = true; // Marks the event as notified 
//             saveEvents(); // Saves the updated events array to localStorage 
//         }
//     });
// }

function checkNotifications() {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                sendNotifications();
            }
        });
    } else {
        sendNotifications();
    }
}

function sendNotifications() {
    const now = new Date();
    events.forEach(e => {
        const eventTime = new Date(`${e.date}T${e.time}`);
        const timeDiff = eventTime - now;

        if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000 && !e.notified && !e.completed) {
            new Notification('Event Reminder', {
                body: `${e.title} at ${e.time} on ${e.date}`
            });
            e.notified = true;
            saveEvents();
        }
    });
}

showWeatherBtn.addEventListener('click', () => {
    if (weatherPopup.classList.contains('hidden')) {
        weatherPopup.classList.remove('hidden');
        weatherPopup.classList.add('fade-in');

        // remove fade-in animation after completion
        setTimeout(() => {
            weatherPopup.classList.remove('fade-in');
        }, 300); // duration here must match the duration in style.css
    } else {
        weatherPopup.classList.add('hidden');
    }
});

getWeatherBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Kindly enter a city name.');
        return;
    }
    fetchWeather(city); // call function fetchWeather to get weather details from OpenWeatherMap API
    clearInterval(weatherInterval); // clear previous intervals
    weatherInterval = setInterval(() => fetchWeather(city), 60 * 1000) // refresh every 60 seconds
});

function fetchWeather(city) {
    const Key = '3977599d15e4601c3982260a383264c9';
    const Url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${Key}&units=metric`;

    fetch(Url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })

    .then(data => {
        const temp = data.main.temp;
        const wind = data.wind.speed;
        const condition = data.weather[0].description;
        const humidity = data.main.humidity;
        weatherDisplay.innerHTML = `
        <strong>Weather in ${data.name}:</strong><br>
        🌡️ Temp: ${temp}°C<br>
        🌬️ Wind: ${wind} m/s<br>
        💧 Humidity: ${humidity}%<br>
        🌤️ Condition: ${condition}`;
    })

    .catch(error => {
        weatherDisplay.innerHTML = `<span style="color:red;">${error.message}</span>`;
    });
}

document.addEventListener('click', function(event) {
    const isClickInside = weatherPopup.contains(event.target) || showWeatherBtn.contains(event.target);
    if (!isClickInside && !weatherPopup.classList.contains('hidden')) {
        weatherPopup.classList.add('hidden');
    }
});


weatherForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    fetchWeather(city);
    clearInterval(weatherInterval);
    weatherInterval = setInterval(() => fetchWeather(city), 60000);
});



if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(reg => {
            console.log('✅ Firebase SW registered:', reg.scope);
        })
        .catch(err => console.error('❌ Firebase SW registration failed:', err));
}


Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
        messaging.getToken({
            vapidKey: 'BN68i00ThnnzKxNEnFHTjmBKsVDZ9cijJX1lXHfIYT4momcKLL8iBnLHJG0kFwDICsrDRupCEFNttBSO2lX92jc'
        }).then(token => {
            console.log('✅ FCM Token:', token);
            // Save this token to your database/server if needed
        }).catch(err => {
            console.error('❌ Error getting FCM token:', err);
        });
    } else {
        console.warn('❌ Permission not granted for notifications');
    }
});

navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(reg => {
        console.log('📲 Firebase SW registered:', reg.scope);
        // Check notifications every minute
        setInterval(checkNotifications, 60 * 1000); // Sets interval to check notifications every minute 
        // Initial check
        checkNotifications(); // Performs an initial notification check on page load 

        // Initial render
        renderEvents(); // Renders events when the page loads
    });