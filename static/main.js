setTimeout(() => {
    document.getElementById('frontPage').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('frontPage').style.display = 'none';
        document.getElementById('mapContainer').style.display = 'block';
    }, 1000);
}, 3000);
let map = L.map('map').setView([51.505, -0.09], 13); // Ensure the map is initialized

// Load and display OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '© OpenStreetMap'
}).addTo(map);

// Variables to store markers and route information
let startMarker, middleMarker, endMarker, polylines = [];

// Function to search locations via Nominatim API
function searchLocation(input, suggestionListId) {
const query = input.value;
if (query.length > 2) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(response => response.json())
        .then(data => {
            const suggestionList = document.getElementById(suggestionListId);
            suggestionList.innerHTML = ''; // Clear previous suggestions
            data.forEach(location => {
                const suggestionItem = document.createElement('div');
                suggestionItem.textContent = location.display_name;
                suggestionItem.onclick = function() {
                    input.value = location.display_name;
                    suggestionList.innerHTML = ''; // Clear suggestions after selection
                };
                suggestionList.appendChild(suggestionItem);
            });
        });
} else {
    document.getElementById(suggestionListId).innerHTML = ''; // Clear suggestions for shorter inputs
}
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript Loaded!");

    // Attach event listener to the history button
    let historyButton = document.getElementById("historyButton");
    if (historyButton) {
        historyButton.addEventListener("click", toggleHistory);
    } else {
        console.error("History button not found!");
    }
});

// Function to toggle history visibility
function toggleHistory() {
    let historyContainer = document.getElementById("historyContainer");
    if (!historyContainer) {
        console.error("History container not found!");
        return;
    }

    if (historyContainer.style.display === "none") {
        displaySearchHistory(); // Update history before showing
        historyContainer.style.display = "block";
        document.getElementById("historyButton").innerText = "Hide History";
    } else {
        historyContainer.style.display = "none";
        document.getElementById("historyButton").innerText = "Show History";
    }
}

// Function to save search history
function saveSearchHistory(start, middle, end) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

    // Add new entry
    const newEntry = { start, middle, end, timestamp: new Date().toLocaleString() };
    history.unshift(newEntry);

    // Keep only the last 5 searches
    if (history.length > 5) history.pop();

    // Save to local storage
    localStorage.setItem("searchHistory", JSON.stringify(history));
}

// Function to display search history
function displaySearchHistory() {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    let historyList = document.getElementById("historyList");

    if (!historyList) {
        console.error("History list not found!");
        return;
    }

    historyList.innerHTML =
        history.length === 0
            ? `<p>No history available</p>`
            : history
                  .map(
                      (entry, index) => `
                <div class="history-item" onclick="loadSearch('${entry.start}', '${entry.middle}', '${entry.end}')">
                    <b>${index + 1}. ${entry.start} → ${entry.middle} → ${entry.end}</b> <br>
                    <small>${entry.timestamp}</small>
                </div>
            `
                  )
                  .join("");
}

// Function to load a search from history
function loadSearch(start, middle, end) {
    document.getElementById("start").value = start;
    document.getElementById("middle").value = middle;
    document.getElementById("end").value = end;
    calculateRoute(); // Recalculate the route automatically
}

// Function to clear existing polylines
function clearPolylines() {
polylines.forEach(polyline => {
    map.removeLayer(polyline);
});
polylines = [];
}



document.getElementById('skipButton').addEventListener('click', function() {
let welcomePage = document.getElementById('welcomePage');
welcomePage.classList.add('fade-out');

// Wait for the animation to complete before hiding
setTimeout(() => {
welcomePage.style.display = 'none';
document.getElementById('mainContent').style.display = 'block';
}, 800);
});


// Main route calculation function
function calculateRoute() {
const start = document.getElementById('start').value;
const middle = document.getElementById('middle').value;
const end = document.getElementById('end').value;

if (!start || !end) {
alert("Please enter at least a start and an end location.");
return;
}

saveSearchHistory(start, middle, end);

const locations = [start, middle, end].filter(loc => loc);

Promise.all(locations.map(loc => geocodeLocation(loc)))
.then(coords => {
    if (coords.includes(null)) {
        alert("Failed to fetch coordinates for one or more locations.");
        return;
    }
    clearPolylines();
    plotRoutes(coords, locations);
})
.catch(error => console.error("Error calculating route:", error));
}

// Fetch coordinates for a location
function geocodeLocation(location) {
return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
.then(response => response.json())
.then(data => {
    if (data.length === 0) return null;
    const { lat, lon } = data[0];
    return [parseFloat(lon), parseFloat(lat)];
});
}

// Fetch route between two coordinates
function fetchRoute(startCoords, endCoords) {
const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.join(',')};${endCoords.join(',')}?overview=full&geometries=geojson`;
return fetch(osrmUrl)
.then(response => response.json())
.then(data => {
    if (data.code !== "Ok") throw new Error("OSRM API error");
    const route = data.routes[0];
    return { distance: route.distance, coordinates: route.geometry.coordinates };
});
}

// Clear existing routes
function clearPolylines() {
polylines.forEach(polyline => map.removeLayer(polyline));
polylines = [];
}

function plotRoutes(coords, locations) {
if (coords.length < 2) {
alert("At least two coordinates are required to plot routes.");
return;
}

// Calculate distance from start to each point
const startCoords = coords[0];
const distancesFromStart = coords.slice(1).map((coord, index) => ({
index: index + 1,
distance: getDistance(startCoords, coord)
}));

// Sort locations by distance from the start
distancesFromStart.sort((a, b) => a.distance - b.distance);

console.log("Sorted distances from start:", distancesFromStart);

const sortedCoords = [startCoords, ...distancesFromStart.map(d => coords[d.index])];
const sortedLocations = [locations[0], ...distancesFromStart.map(d => locations[d.index])];

const routePromises = [];
for (let i = 0; i < sortedCoords.length - 1; i++) {
routePromises.push(fetchRoute(sortedCoords[i], sortedCoords[i + 1]));
}

Promise.all(routePromises)
.then(routes => {
    routes.forEach((route, index) => {
        let color = index === 0 ? "red" : "blue"; // Nearest in red, others in blue

        drawRoute(route, color);

        console.log(`Route ${index + 1}: ${sortedLocations[index]} → ${sortedLocations[index + 1]} | Distance: ${route.distance} | Color: ${color}`);
    });

    // Update UI
    const sortedDistances = routes.map(route => route.distance);
    displayRouteDetails(sortedLocations, sortedDistances);
})
.catch(error => {
    console.error("Error fetching routes:", error);
    alert("Failed to fetch one or more route segments.");
});
}

// Helper function to calculate distance between two points
function getDistance(coord1, coord2) {
const R = 6371e3; // Earth radius in meters
const lat1 = coord1[1] * Math.PI / 180;
const lat2 = coord2[1] * Math.PI / 180;
const deltaLat = (coord2[1] - coord1[1]) * Math.PI / 180;
const deltaLon = (coord2[0] - coord1[0]) * Math.PI / 180;

const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
Math.cos(lat1) * Math.cos(lat2) *
Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

return R * c; // Distance in meters
}



// Draw a route on the map
function drawRoute(route, color) {
const polyline = L.polyline(route.coordinates.map(coord => [coord[1], coord[0]]), {
color: color,
weight: 5,
opacity: 0.7
}).addTo(map);
polylines.push(polyline);
map.fitBounds(polyline.getBounds());
}

// Update route details in UI
function displayRouteDetails(locations, distances) {
const totalDistance = distances.reduce((acc, dist) => acc + dist, 0);
document.getElementById("route-display").innerHTML = locations.join(' → ');
distances.forEach((dist, i) => {
document.getElementById(`leg${i + 1}-label`).innerHTML = `${locations[i]} → ${locations[i + 1]}:`;
document.getElementById(`leg${i + 1}-distance`).innerHTML = `${(dist / 1000).toFixed(2)} km`;
});
document.getElementById("total-distance").innerHTML = `${(totalDistance / 1000).toFixed(2)} km`;
}

// Hide front page after a delay
window.onload = function() {
const frontPage = document.getElementById('frontPage');
if (frontPage) {
setTimeout(() => frontPage.style.display = 'none', 3000);
}
};

function resetForm() {
// Clear input fields
const startInput = document.getElementById('start');
const middleInput = document.getElementById('middle');
const endInput = document.getElementById('end');
const transportMode = document.getElementById('transportMode');
const resultContainer = document.getElementById('resultContainer');

if (startInput) startInput.value = '';
if (middleInput) middleInput.value = '';
if (endInput) endInput.value = '';

// Reset transport mode selection
if (transportMode) {
transportMode.selectedIndex = 0; // Reset to default option
}

// Clear markers
if (startMarker) {
map.removeLayer(startMarker);
startMarker = null;
}
if (middleMarker) {
map.removeLayer(middleMarker);
middleMarker = null;
}
if (endMarker) {
map.removeLayer(endMarker);
endMarker = null;
}

// Clear existing routes
clearPolylines();
map.eachLayer(layer => {
if (layer instanceof L.Polyline) {
    map.removeLayer(layer);
}
});

// Clear result info and route details
if (resultContainer) resultContainer.innerHTML = '';
document.getElementById("route-display").innerHTML = '';
document.getElementById("route-options").innerHTML = '';
document.getElementById("total-distance").innerHTML = '';

// Collapse any open distance or transport sections
const distanceInfo = document.querySelectorAll('.distance-info, .transport-modes');
distanceInfo.forEach(info => info.style.display = 'none');

// Reset map view
map.setView([51.505, -0.09], 13);

alert('Map has been reset!');
}



// Add legend to explain route colors
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
const div = L.DomUtil.create('div', 'info legend');
div.innerHTML = `
<h4>Route Legend</h4>
<div><span style="background: red; width: 20px; height: 10px; display: inline-block; margin-right: 5px;"></span> Nearest Location</div>
<div><span style="background: blue; width: 20px; height: 10px; display: inline-block; margin-right: 5px;"></span> Farther Location</div>
`;
return div;
};

legend.addTo(map);

// Transport speeds (km/h)
const speeds = { 
    walking: 5, 
    bicycle: 15,
    bus: 25, 
    car: 60, 
    motorbike: 45, 
    train: 40,
    expressTrain: 80
};

// Cost per km in Indian Rupees (₹)
const costPerKm = {
    bus: 1.50,           // ₹5 per km
    train: 0.65,         // ₹0.65 per km
    expressTrain: 0.50  // ₹0.50 per km
};

// Default fuel efficiency (km per liter) and fuel price (₹ per liter)
let userFuelEfficiency = {
    car: 15,       // Default: 15 km per liter
    motorbike: 40  // Default: 30 km per liter
};
let fuelPrice = 100;  // Default fuel price ₹100 per liter

const EXPRESS_TRAIN_TIME_THRESHOLD = 180; // 3 hours (in minutes)

// Function to display route details with cost estimation
function displayRouteDetails(locations, distances) {
    let routeDisplay = locations.join(" → ");
    document.getElementById("route-display").innerHTML = `<b>Route:</b> ${routeDisplay}`;
    
    let modes = ['walking', 'bicycle', 'bus', 'car', 'motorbike', 'train'];
    let totalDistance = distances.reduce((a, b) => a + b, 0) / 1000;

     // Check if the total train travel time exceeds 3 hours (180 minutes)
     let trainTime = (totalDistance / speeds['train']) * 60;
    if (trainTime > EXPRESS_TRAIN_TIME_THRESHOLD) {
        modes.push('expressTrain');
    }

    let routeOptions = locations.map((location, index) => {
        if (index === locations.length - 1) return '';
        let segmentDistance = distances[index] / 1000;

        return `
            <div class="route-segment">
                <h3>
                    <button class="dropdown-btn" onclick="toggleTransportModes(${index})">
                        ${location} → ${locations[index + 1]}
                    </button>
                </h3>
                <div id="transport-modes-${index}" class="transport-modes" style="display: none;">
                    <b>Distance:</b> ${segmentDistance.toFixed(2)} km
                    <ul>
                        ${modes.map(mode => `
                            <li class="mode-${mode}">
                                ${getModeEmoji(mode)} <b>${formatModeName(mode)}:</b> 
                                ${calculateTime(segmentDistance, mode)} 
                                ${calculateCost(segmentDistance, mode)}
                            </li>
                        `).join("")}
                    </ul>
                </div>
            </div>`;
    }).join("");

    // Add total travel time & cost for all transport modes
    let totalTravelTime = `
        <div class="route-segment total-time">
            <h2>
                <button class="dropdown-btn" onclick="toggleTransportModes('total')">
                    Total Travel Time & Cost
                </button>
            </h2>
            <div id="transport-modes-total" class="transport-modes" style="display: none;">
                <b>Route:</b> ${locations.join(" → ")}<br>
                <b>Total Distance:</b> ${totalDistance.toFixed(2)} km
                <ul>
                    ${modes.map(mode => {
                        let totalTime = distances.reduce((sum, dist) => sum + (dist / 1000 / speeds[mode] * 60), 0);
                        let totalCost = calculateTotalCost(totalDistance, mode);
                        return `
                            <li class="mode-${mode}">
                                ${getModeEmoji(mode)} <b>${formatModeName(mode)}:</b> 
                                ${formatTime(totalTime)} 
                                ${totalCost}
                            </li>`;
                    }).join("")}
                </ul>
            </div>
        </div>`;

    routeOptions += totalTravelTime;

    document.getElementById("route-options").innerHTML = routeOptions;
    document.getElementById("total-distance").innerHTML = `<b>Distance:</b> ${totalDistance.toFixed(2)} km`;
}

// Function to toggle transport mode visibility
function toggleTransportModes(index) {
    let element = document.getElementById(`transport-modes-${index}`);
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

// Function to get emoji for transport mode
function getModeEmoji(mode) {
    const emojis = { walking: "🚶", bicycle: "🚲", bus: "🚌", car: "🚗", motorbike: "🏍", train: "🚆" };
    return emojis[mode] || "";
}

// Function to format mode names
function formatModeName(mode) {
    return mode === 'expressTrain' ? 'Express Train' : mode.charAt(0).toUpperCase() + mode.slice(1);
}

// Function to calculate estimated time
function calculateTime(distance, mode) {
    let time = distance / speeds[mode] * 60;
    return formatTime(time);
}

// Function to format time in hr min format
function formatTime(time) {
    let hours = Math.floor(time / 60);
    let minutes = Math.round(time % 60);
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
}

// Function to calculate cost estimation
function calculateCost(distance, mode) {
    if (mode === "walking" || mode === "bicycle") return ""; // No cost for walking or cycling

    if (costPerKm[mode]) {
        return ` | ₹${(distance * costPerKm[mode]).toFixed(2)}`;
    }

    if (mode === "car" || mode === "motorbike") {
        let fuelUsed = distance / userFuelEfficiency[mode]; // Liters used
        let cost = fuelUsed * fuelPrice;
        return ` | ₹${cost.toFixed(2)}`;
    }

    return "";
}

// Function to calculate total cost for all transport modes
function calculateTotalCost(distance, mode) {
    if (mode === "walking" || mode === "bicycle") return ""; // No cost for walking or cycling

    if (costPerKm[mode]) {
        return ` | ₹${(distance * costPerKm[mode]).toFixed(2)}`;
    }

    if (mode === "car" || mode === "motorbike") {
        let fuelUsed = distance / userFuelEfficiency[mode]; // Liters used
        let cost = fuelUsed * fuelPrice;
        return ` | ₹${cost.toFixed(2)}`;
    }

    return "";
}

// CSS for styling
const style = document.createElement('style');
style.innerHTML = `

`;
document.head.appendChild(style);
