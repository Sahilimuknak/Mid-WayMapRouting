# 🌍 Map Route Planner

An interactive web-based route planner that calculates the **shortest** and **fastest** paths 
between two or more locations using algorithms like **Dijkstra**, **A\***, and services like **OSRM** and **Google Maps API**.
It supports multiple transport modes, cost estimation, and displays results on a Leaflet-powered world map.


## 🚀 Features

- 🗺️ **Interactive World Map** using Leaflet.js
- 📍 **Shortest and Fastest Route Calculation** via:
  - Dijkstra's Algorithm
  - OSRM backend for real-time routing data
- 🚗 **Transport Modes**: Car, Bike, Walk
- ⏱️ **Travel Time & Distance** Calculation
- 💰 **Cost Estimation** based on mode & distance
- 🔍 **Search History** saved for quick access
- ⚙️ **Customizable Backend** with Flask

---

## 🧑‍💻 Tech Stack

- **Frontend**: HTML, CSS, JavaScript, [Leaflet.js](https://leafletjs.com/)
- **Backend**: Python, [Flask](https://flask.palletsprojects.com/)
- **Routing Engine**: OSRM, Custom Dijkstra & A* implementations



## 🛠️ Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/map-route-planner.git
   cd map-route-planner
