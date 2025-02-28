import React from "react";
import Markdown from "react-markdown";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamAnalysis.scss";

const DreamAnalysis = () => {
  const { 
    currentDream, 
    currentAnalysis, 
    currentEntryTimestamp, 
    lastUpdated 
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
    <section 
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
      
      <div className="analysis-content">
        <h3>Dream:</h3>
        <div className="dream-content">
          <p>{currentDream}</p>
        </div>
        
        <h3>Analysis:</h3>
        <div 
          className="markdown-content" 
          aria-live="polite"
        >
          <Markdown>{currentAnalysis}</Markdown>
        </div>
      </div>
    </section>
  );
};

export default DreamAnalysis;