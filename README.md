# 🧘‍♂️ Bad Posture Detection App

A real-time posture analysis application that uses computer vision and machine learning to detect bad posture during squats and desk sitting. Built with Flask backend and React frontend.

## 🎯 Features

- **Real-time Webcam Analysis**: Live posture monitoring with instant feedback
- **Video Upload Processing**: Analyze uploaded videos for comprehensive posture assessment
- **Dual Analysis Modes**: 
  - Sitting posture analysis (desk work)
  - Squat form analysis (exercise)
- **Rule-based Detection**: Custom algorithms for identifying posture issues
- **Visual Feedback**: Annotated pose landmarks and detailed analysis results
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Flask** - Python web framework
- **MediaPipe** - Google's pose detection library
- **OpenCV** - Computer vision processing
- **Socket.IO** - Real-time communication
- **NumPy** - Numerical computations

### Frontend
- **React.js** - User interface framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Modern CSS** - Responsive design with glassmorphism

## 📋 Requirements

### Backend Dependencies
```
flask==2.3.3
flask-cors==4.0.0
opencv-python==4.8.1.78
mediapipe==0.10.7
numpy==1.24.3
pillow==10.0.1
python-socketio==5.9.0
flask-socketio==5.3.6
```

### Frontend Dependencies
- Node.js (v16 or higher)
- React 18+
- Modern web browser with webcam support

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd realfy-posture-detection
```

### 2. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```
The backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the React development server
npm start
```
The frontend will run on `http://localhost:3000`

## 🎮 Usage

### Webcam Analysis
1. Open the application in your browser
2. Click "Live Webcam" mode
3. Select posture type (Sitting or Squat)
4. Click "Start Capture" to begin analysis
5. View real-time feedback and posture status

### Video Upload
1. Click "Upload Video" mode
2. Select posture type
3. Drag and drop or select a video file (MP4, AVI, MOV)
4. Click "Analyze Video" for comprehensive analysis
5. Review frame-by-frame results and statistics

## 🔍 Analysis Details

### Sitting Posture Analysis
- **Neck angle**: Detects forward head posture (>30° flagged)
- **Back straightness**: Monitors spinal alignment
- **Shoulder alignment**: Checks for uneven shoulders

### Squat Analysis
- **Knee tracking**: Prevents knee-over-toe positioning
- **Back angle**: Maintains proper spinal position (>150°)
- **Movement quality**: Assesses squat depth and form

## 🏗️ Project Structure

```
realfy-posture-detection/
├── app.py                    # Flask server and API endpoints
├── posture_analyzer.py       # Core analysis logic
├── requirements.txt          # Python dependencies
├── uploads/                  # Temporary video storage
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── App.js           # Main application
│   │   └── index.css        # Styling
│   └── package.json         # Node.js dependencies
└── .github/
    └── copilot-instructions.md
```

## 🔧 API Endpoints

### REST API
- `GET /health` - Server health check
- `POST /analyze-frame` - Single frame analysis
- `POST /upload-video` - Video upload and processing

### WebSocket Events
- `analyze_webcam_frame` - Real-time frame analysis
- `posture_analysis` - Analysis results
- `error` - Error notifications

## 🎨 UI Features

- **Glassmorphism Design**: Modern, translucent interface
- **Real-time Feedback**: Instant posture status updates
- **Progress Indicators**: Upload and analysis progress
- **Responsive Layout**: Mobile-friendly design
- **Visual Analytics**: Charts and statistics display

## 🔬 Technical Implementation

### Pose Detection
- Uses MediaPipe's 33-point pose landmarks
- Processes video frames at 2 FPS for real-time analysis
- Calculates joint angles using trigonometry

### Rule-based Analysis
- Custom algorithms for posture assessment
- Configurable thresholds for different posture types
- Frame-by-frame analysis with aggregated results

### Performance Optimization
- Efficient frame processing with OpenCV
- Optimized Socket.IO communication
- Lazy loading for video components

## 🚨 Troubleshooting

### Common Issues
1. **Webcam Access**: Ensure browser permissions are granted
2. **CORS Errors**: Check Flask-CORS configuration
3. **Video Upload**: Verify file format and size limits
4. **Poor Detection**: Ensure good lighting and full body visibility

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari (limited WebRTC support)
- Edge

## 🔮 Future Enhancements

- Machine learning model integration
- Historical posture tracking
- Mobile app development
- Multiple person detection
- Exercise routine recommendations

## 📄 License

This project is developed for Realfy as a technical assessment.

## 🤝 Contributing

This is a technical assessment project. For questions or issues, please contact the development team.

---

Built with ❤️ for better posture and healthier work habits!
