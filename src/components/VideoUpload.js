import React, { useState, useRef } from 'react';
import axios from 'axios';

const VideoUpload = ({ postureType, onAnalysisStart, onAnalysisComplete, onAnalysisError, isAnalyzing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      onAnalysisError('Please select a valid video file (MP4, AVI, MOV)');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      onAnalysisError('File size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onAnalysisError('Please select a video file');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('posture_type', postureType);

    try {
      onAnalysisStart();
      setUploadProgress(0);

      const response = await axios.post('/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      onAnalysisComplete(response.data);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      onAnalysisError(
        error.response?.data?.error || 'Failed to upload and analyze video'
      );
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="upload-section">
      <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
        📁 Upload Video for Analysis
      </h2>

      {!selectedFile ? (
        <div
          className={`upload-area ${isDragOver ? 'dragover' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
            📹
          </div>
          <h3>Drop your video here or click to browse</h3>
          <p>Supported formats: MP4, AVI, MOV (Max 100MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept="video/*"
            onChange={handleFileInputChange}
          />
        </div>
      ) : (
        <div className="file-selected">
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            color: '#333'
          }}>
            <h4>Selected File:</h4>
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>

          <div className="controls">
            <button
              className="control-btn"
              onClick={handleUpload}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Video'}
            </button>
            <button
              className="control-btn stop"
              onClick={clearFile}
              disabled={isAnalyzing}
            >
              Clear File
            </button>
          </div>

          {uploadProgress > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ color: 'white', marginBottom: '10px' }}>
                Upload Progress: {uploadProgress}%
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px', color: 'white', fontSize: '0.9rem', textAlign: 'center' }}>
        <p>💡 <strong>Tips:</strong></p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>• Ensure good lighting in your video</li>
          <li>• Keep the camera steady</li>
          <li>• Make sure your full body is visible for squat analysis</li>
          <li>• For sitting analysis, upper body should be clearly visible</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUpload;
