from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import base64
import io
from PIL import Image
import json
from posture_analyzer import PostureAnalyzer
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize posture analyzer
analyzer = PostureAnalyzer()

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Posture detection server is running"})

@app.route('/analyze-frame', methods=['POST'])
def analyze_frame():
    try:
        data = request.json
        
        # Decode base64 image
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        image = Image.open(io.BytesIO(image_bytes))
        frame = np.array(image)
        
        # Convert RGB to BGR for OpenCV
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Get posture type from request
        posture_type = data.get('posture_type', 'sitting')
        
        # Analyze frame
        result = analyzer.analyze_frame(frame, posture_type)
        
        # Convert annotated frame back to base64 if available
        if 'annotated_frame' in result:
            annotated_frame = result['annotated_frame']
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            img_str = base64.b64encode(buffer).decode()
            result['annotated_image'] = f"data:image/jpeg;base64,{img_str}"
            del result['annotated_frame']  # Remove numpy array from response
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload-video', methods=['POST'])
def upload_video():
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
        
        file = request.files['video']
        posture_type = request.form.get('posture_type', 'sitting')
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Process video
            results = process_video(filepath, posture_type)
            
            # Clean up uploaded file
            os.remove(filepath)
            
            return jsonify(results)
        else:
            return jsonify({"error": "Invalid file type"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def process_video(video_path, posture_type):
    """Process entire video and return frame-by-frame analysis."""
    cap = cv2.VideoCapture(video_path)
    results = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Analyze every 10th frame to reduce processing time
        if frame_count % 10 == 0:
            result = analyzer.analyze_frame(frame, posture_type)
            
            # Remove annotated frame to reduce response size
            if 'annotated_frame' in result:
                del result['annotated_frame']
            
            result['frame_number'] = frame_count
            result['timestamp'] = frame_count / cap.get(cv2.CAP_PROP_FPS)
            results.append(result)
        
        frame_count += 1
    
    cap.release()
    
    # Calculate summary statistics
    total_frames = len(results)
    bad_posture_frames = sum(1 for r in results if not r['is_good_posture'])
    
    return {
        "total_frames_analyzed": total_frames,
        "bad_posture_frames": bad_posture_frames,
        "good_posture_percentage": ((total_frames - bad_posture_frames) / total_frames * 100) if total_frames > 0 else 0,
        "frame_results": results
    }

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connected', {'data': 'Connected to posture analysis server'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('analyze_webcam_frame')
def handle_webcam_frame(data):
    try:
        # Decode base64 image
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        image = Image.open(io.BytesIO(image_bytes))
        frame = np.array(image)
        
        # Convert RGB to BGR for OpenCV
        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
        
        # Get posture type
        posture_type = data.get('posture_type', 'sitting')
        
        # Analyze frame
        result = analyzer.analyze_frame(frame, posture_type)
        
        # Convert annotated frame back to base64 if available
        if 'annotated_frame' in result:
            annotated_frame = result['annotated_frame']
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            img_str = base64.b64encode(buffer).decode()
            result['annotated_image'] = f"data:image/jpeg;base64,{img_str}"
            del result['annotated_frame']  # Remove numpy array from response
        
        # Send result back to client
        emit('posture_analysis', result)
        
    except Exception as e:
        emit('error', {'message': str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
