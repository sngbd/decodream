import React from "react";
import Markdown from "react-markdown";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamAnalysis.scss";

const DreamAnalysis = () => {
  const { 
    currentDream, 
    currentAnalysis, 
    currentEntryTimestamp, 
    lastUpdated,
    currentImage,
  } = useDreams();

  if (!currentAnalysis) {
    return null;
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(Number(timestamp));
    
    // Check if date is valid
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createdDate = formatDate(currentEntryTimestamp);
  const updatedDate = formatDate(lastUpdated);

  return (
    <div 
      className="dream-analysis" 
      aria-labelledby="analysis-title"
    >
      <div className="analysis-header">
        <h2 id="analysis-title">Dream Analysis</h2>
        <div className="timestamp-info" aria-live="polite">
          {createdDate && (
            <p>
              <time dateTime={new Date(Number(currentEntryTimestamp)).toISOString()}>
                <strong>Created:</strong> {createdDate}
              </time>
            </p>
          )}
          {updatedDate && lastUpdated !== currentEntryTimestamp && (
            <p>
              <time dateTime={new Date(Number(lastUpdated)).toISOString()}>
                <strong>Updated:</strong> {updatedDate}
              </time>
            </p>
          )}
        </div>
      </div>
      
      <h3>Dream:</h3>
      <div className="dream-content">
        {currentDream}
      </div>

      {currentImage && currentImage !== "" && (
        <div className="dream-image-section">
          <h3>Dream Visualization</h3>
          <img 
            src={`data:image/png;base64,${currentImage}`} 
            alt="Dream visualization"
            className="dream-image"
          />
        </div>
      )}
      
      <h3>Analysis:</h3>
      <div className="markdown-content">
        <Markdown>{currentAnalysis}</Markdown>
      </div>
    </div>
  );
};

export default DreamAnalysis;