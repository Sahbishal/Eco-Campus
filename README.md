# Eco Campus

A smart campus energy management system with real-time occupancy detection and optimization.

## Features

- **Real-time Occupancy Detection**: Uses computer vision to detect people in classrooms
- **Energy Optimization**: Automatically adjusts HVAC and lighting based on occupancy
- **Analytics Dashboard**: Web interface to monitor energy consumption and savings
- **API Backend**: FastAPI server providing REST endpoints for data and control

## Tech Stack

- **Backend**: Python, FastAPI, OpenCV, NumPy
- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Database**: In-memory (can be extended to persistent storage)

## Project Structure

```
eco-campus/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── cv_engine.py         # Computer vision occupancy detection
│   ├── optimization.py      # Energy optimization logic
│   ├── analytics.py         # Data analytics and predictions
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── index.css        # Styles
│   │   └── main.tsx         # App entry point
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
└── README.md
```

## Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   python -m backend.main
   ```
   The API will be available at http://localhost:8000

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   The dashboard will be available at http://localhost:5173

## API Endpoints

- `GET /` - Welcome message
- `GET /classrooms` - List all classrooms with status
- `GET /stats` - Energy consumption statistics
- `POST /occupancy-update/{classroom_id}` - Update occupancy count
- `GET /alerts` - Get anomaly alerts
- `GET /predictions` - Get energy usage predictions

## Features in Detail

### Occupancy Detection
The system uses OpenCV's HOG (Histogram of Oriented Gradients) person detector to count people in video streams from cameras placed in classrooms.

### Energy Optimization
Based on occupancy data, the system optimizes:
- HVAC settings (ON/OFF based on presence)
- Lighting levels (ON/DIMMED/OFF based on occupancy and ambient light)

### Analytics
- Tracks energy consumption over time
- Detects anomalies in usage patterns
- Provides predictions for future energy needs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.