import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import WebcamCapture from './components/WebcamCapture';
import VideoUpload from './components/VideoUpload';
import AnalysisResults from './components/AnalysisResults';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [mode, setMode] = useState('webcam'); // 'webcam' or 'upload'
  const [postureType, setPostureType] = useState('sitting'); // 'sitting' or 'squat'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const socketConnection = io(API_BASE_URL);
    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      console.log('Connected to server');
    });

    socketConnection.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResults(null);
    setError(null);
  };

  const handlePostureTypeChange = (newType) => {
    setPostureType(newType);
    setResults(null);
    setError(null);
  };

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setError(null);
  };

  const handleAnalysisComplete = (analysisResults) => {
    setIsAnalyzing(false);
    setResults(analysisResults);
  };

  const handleAnalysisError = (errorMessage) => {
    setIsAnalyzing(false);
    setError(errorMessage);
    setResults(null);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🧘‍♂️ Posture Detection App</h1>
        <p>Real-time posture analysis using AI-powered computer vision</p>
      </header>

      {/* Mode Selection */}
      <div className="mode-selector">
        <button
          className={`mode-btn ${mode === 'webcam' ? 'active' : ''}`}
          onClick={() => handleModeChange('webcam')}
        >
          📷 Live Webcam
        </button>
        <button
          className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => handleModeChange('upload')}
        >
          📁 Upload Video
        </button>
      </div>

      {/* Posture Type Selection */}
      <div className="posture-selector">
        <button
          className={`posture-btn ${postureType === 'sitting' ? 'active' : ''}`}
          onClick={() => handlePostureTypeChange('sitting')}
        >
          🪑 Sitting Posture
        </button>
        <button
          className={`posture-btn ${postureType === 'squat' ? 'active' : ''}`}
          onClick={() => handlePostureTypeChange('squat')}
        >
          🏋️‍♂️ Squat Analysis
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Content */}
      {mode === 'webcam' ? (
        <WebcamCapture
          socket={socket}
          postureType={postureType}
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisError={handleAnalysisError}
          isAnalyzing={isAnalyzing}
        />
      ) : (
        <VideoUpload
          postureType={postureType}
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onAnalysisError={handleAnalysisError}
          isAnalyzing={isAnalyzing}
        />
      )}

      {/* Analysis Results */}
      {results && (
        <AnalysisResults
          results={results}
          mode={mode}
          postureType={postureType}
        />
      )}

      {/* Loading Indicator */}
      {isAnalyzing && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Analyzing posture...</p>
        </div>
      )}
    </div>
  );
}

export default App;
