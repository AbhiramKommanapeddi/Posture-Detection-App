import React from 'react';

const AnalysisResults = ({ results, mode, postureType }) => {
  if (!results) return null;

  // Handle webcam results (single frame analysis)
  if (mode === 'webcam') {
    return (
      <div className="analysis-results">
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
          📊 Analysis Results
        </h2>
        
        <div className={`result-card ${results.is_good_posture ? 'good' : 'bad'}`}>
          <div className="result-header">
            <h3>Posture Analysis - {postureType.charAt(0).toUpperCase() + postureType.slice(1)}</h3>
            <span className={`status-badge ${results.is_good_posture ? 'good' : 'bad'}`}>
              {results.is_good_posture ? '✅ Good Posture' : '❌ Bad Posture'}
            </span>
          </div>
          
          {results.issues && results.issues.length > 0 && (
            <div>
              <h4>Issues Detected:</h4>
              <ul className="issues-list">
                {results.issues.map((issue, index) => (
                  <li key={index}>⚠️ {issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {results.angles && (
            <div style={{ marginTop: '20px' }}>
              <h4>Measurements:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {Object.entries(results.angles).map(([key, value]) => (
                  <div key={key} style={{ padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                    <strong>{key.replace('_', ' ').toUpperCase()}:</strong><br />
                    {typeof value === 'number' ? `${value.toFixed(1)}°` : value.toFixed(3)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {results.annotated_image && (
            <div style={{ marginTop: '20px' }}>
              <h4>Pose Landmarks:</h4>
              <img 
                src={results.annotated_image} 
                alt="Annotated pose" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '10px',
                  border: '2px solid rgba(255,255,255,0.3)'
                }} 
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle video upload results (multiple frames analysis)
  if (mode === 'upload' && results.frame_results) {
    const goodPostureFrames = results.total_frames_analyzed - results.bad_posture_frames;
    const badPosturePercentage = (results.bad_posture_frames / results.total_frames_analyzed * 100).toFixed(1);
    
    return (
      <div className="analysis-results">
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
          📊 Video Analysis Results
        </h2>
        
        {/* Summary Statistics */}
        <div className="video-summary">
          <h3>Analysis Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-value">{results.total_frames_analyzed}</div>
              <div className="stat-label">Total Frames Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#4CAF50' }}>{goodPostureFrames}</div>
              <div className="stat-label">Good Posture Frames</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: '#f44336' }}>{results.bad_posture_frames}</div>
              <div className="stat-label">Bad Posture Frames</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: results.good_posture_percentage >= 70 ? '#4CAF50' : '#f44336' }}>
                {results.good_posture_percentage.toFixed(1)}%
              </div>
              <div className="stat-label">Good Posture Percentage</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Good Posture</span>
              <span>{results.good_posture_percentage.toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${results.good_posture_percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overall Assessment */}
        <div className={`result-card ${results.good_posture_percentage >= 70 ? 'good' : 'bad'}`}>
          <div className="result-header">
            <h3>Overall Assessment</h3>
            <span className={`status-badge ${results.good_posture_percentage >= 70 ? 'good' : 'bad'}`}>
              {results.good_posture_percentage >= 70 ? '✅ Generally Good' : '❌ Needs Improvement'}
            </span>
          </div>
          
          <p>
            {results.good_posture_percentage >= 70 
              ? `Great job! You maintained good posture for ${results.good_posture_percentage.toFixed(1)}% of the video.`
              : `Your posture needs improvement. You had good posture for only ${results.good_posture_percentage.toFixed(1)}% of the video.`
            }
          </p>
        </div>

        {/* Frame-by-Frame Analysis */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: 'white', marginBottom: '15px' }}>Frame-by-Frame Analysis</h3>
          
          {/* Show first few bad posture instances */}
          {results.frame_results
            .filter(frame => !frame.is_good_posture)
            .slice(0, 5)
            .map((frame, index) => (
            <div key={index} className="result-card bad" style={{ marginBottom: '15px' }}>
              <div className="result-header">
                <h4>Frame {frame.frame_number} ({frame.timestamp.toFixed(1)}s)</h4>
                <span className="status-badge bad">❌ Bad Posture</span>
              </div>
              
              {frame.issues && frame.issues.length > 0 && (
                <div>
                  <h5>Issues:</h5>
                  <ul className="issues-list">
                    {frame.issues.map((issue, issueIndex) => (
                      <li key={issueIndex}>⚠️ {issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {frame.angles && (
                <div style={{ marginTop: '10px' }}>
                  <h5>Measurements:</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                    {Object.entries(frame.angles).map(([key, value]) => (
                      <div key={key} style={{ padding: '5px', background: 'rgba(0,0,0,0.1)', borderRadius: '5px', fontSize: '0.9rem' }}>
                        <strong>{key.replace('_', ' ')}:</strong><br />
                        {typeof value === 'number' ? `${value.toFixed(1)}°` : value.toFixed(3)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {results.frame_results.filter(frame => !frame.is_good_posture).length > 5 && (
            <div style={{ color: 'white', textAlign: 'center', margin: '20px 0' }}>
              <p>... and {results.frame_results.filter(frame => !frame.is_good_posture).length - 5} more instances of bad posture</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="result-card" style={{ marginTop: '20px' }}>
          <h3>💡 Recommendations</h3>
          
          {postureType === 'sitting' && (
            <div>
              <h4>For Better Sitting Posture:</h4>
              <ul>
                <li>Keep your back straight and shoulders relaxed</li>
                <li>Position your monitor at eye level</li>
                <li>Take regular breaks to stand and stretch</li>
                <li>Keep your feet flat on the floor</li>
                <li>Avoid slouching or leaning forward</li>
              </ul>
            </div>
          )}
          
          {postureType === 'squat' && (
            <div>
              <h4>For Better Squat Form:</h4>
              <ul>
                <li>Keep your knees behind your toes</li>
                <li>Maintain a straight back throughout the movement</li>
                <li>Engage your core muscles</li>
                <li>Keep your weight on your heels</li>
                <li>Don't let your knees cave inward</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AnalysisResults;
