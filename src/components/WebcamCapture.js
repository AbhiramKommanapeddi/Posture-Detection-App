import React, { useRef, useEffect, useState } from 'react';

const WebcamCapture = ({ socket, postureType, onAnalysisStart, onAnalysisComplete, onAnalysisError, isAnalyzing }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on('posture_analysis', handleAnalysisResult);
      socket.on('error', handleSocketError);
    }

    return () => {
      if (socket) {
        socket.off('posture_analysis', handleAnalysisResult);
        socket.off('error', handleSocketError);
      }
    };
  }, [socket]);

  const handleAnalysisResult = (result) => {
    setCurrentAnalysis(result);
    onAnalysisComplete(result);
  };

  const handleSocketError = (error) => {
    console.error('Socket error:', error);
    onAnalysisError(error.message);
  };

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      setStream(mediaStream);
      setIsCapturing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      onAnalysisStart();
      
      // Start sending frames for analysis
      intervalRef.current = setInterval(() => {
        captureFrame();
      }, 500); // Analyze every 500ms
      
    } catch (error) {
      console.error('Error accessing webcam:', error);
      onAnalysisError('Unable to access webcam. Please check permissions.');
    }
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsCapturing(false);
    setCurrentAnalysis(null);
    onAnalysisComplete(null);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !socket) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    // Send frame to server for analysis
    socket.emit('analyze_webcam_frame', {
      image: imageData,
      posture_type: postureType
    });
  };

  return (
    <div className="webcam-section">
      <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
        📷 Live Webcam Analysis
      </h2>
      
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-element"
          autoPlay
          playsInline
          muted
          style={{ display: isCapturing ? 'block' : 'none' }}
        />
        
        {!isCapturing && (
          <div className="video-placeholder" style={{
            width: '640px',
            height: '480px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            Click "Start Capture" to begin
          </div>
        )}
      </div>

      <div className="controls">
        {!isCapturing ? (
          <button className="control-btn" onClick={startCapture}>
            Start Capture
          </button>
        ) : (
          <button className="control-btn stop" onClick={stopCapture}>
            Stop Capture
          </button>
        )}
      </div>

      {/* Real-time Analysis Display */}
      {currentAnalysis && (
        <div className="analysis-results">
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Real-time Analysis</h3>
          <div className={`result-card ${currentAnalysis.is_good_posture ? 'good' : 'bad'}`}>
            <div className="result-header">
              <h4>Current Posture Status</h4>
              <span className={`status-badge ${currentAnalysis.is_good_posture ? 'good' : 'bad'}`}>
                {currentAnalysis.is_good_posture ? '✅ Good Posture' : '❌ Bad Posture'}
              </span>
            </div>
            
            {currentAnalysis.issues && currentAnalysis.issues.length > 0 && (
              <div>
                <h5>Issues Detected:</h5>
                <ul className="issues-list">
                  {currentAnalysis.issues.map((issue, index) => (
                    <li key={index}>⚠️ {issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {currentAnalysis.angles && (
              <div style={{ marginTop: '15px' }}>
                <h5>Measurements:</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {Object.entries(currentAnalysis.angles).map(([key, value]) => (
                    <div key={key} style={{ padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '5px' }}>
                      <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {
                        typeof value === 'number' ? `${value.toFixed(1)}°` : value.toFixed(3)
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default WebcamCapture;
