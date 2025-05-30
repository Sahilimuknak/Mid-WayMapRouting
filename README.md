# 🌍 Map Route Planner

An interactive web-based route planner that calculates the **shortest** and **fastest** paths 
between two or more locations using algorithms like **Dijkstra** and services like **OSRM** .
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
   git clone https://github.com/Sahilimuknak/Mid-WayMapRouting.git
   cd Routeplanner
2. Set up a Python virtual environment:
     python -m venv venv
     source venv/bin/activate  # or venv\Scripts\activate on Windows

3. Install dependencies:
    pip install -r requirements.txt
   
5. Run the Flask app:
   python app.py
   
7. Visit the app in your browser:
    http://localhost:5000

.

📂 Project Structure

├── app.py                  # Flask backend
├── templates/              # HTML files
├── static/                 # JS, CSS
├── routing/                # Dijkstra  logic
├── requirements.txt
└── README.md

📖 Future Improvements
✅ Live traffic-aware routing
✅ Real-time cost adjustment based on mode
🔄 User authentication and saved routes
📈 Route analytics and usage stats

