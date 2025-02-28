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
    return new Date(Number(timestamp)).toLocaleString();
  };

  return (
    <div className="dream-analysis">
      <div className="analysis-header">
        <h2>Current Analysis</h2>
        <div className="timestamp-info">
          {currentEntryTimestamp && (
            <p>
              <strong>Created:</strong> {formatDate(currentEntryTimestamp)}
            </p>
          )}
          {lastUpdated && (
            <p>
              <strong>Updated:</strong> {formatDate(lastUpdated)}
            </p>
          )}
        </div>
      </div>
      
      <h3>Dream:</h3>
      <div className="dream-content">
        {currentDream}
      </div>
      
      <h3>Analysis:</h3>
      <div className="markdown-content">
        <Markdown>{currentAnalysis}</Markdown>
      </div>
    </div>
  );
};

export default DreamAnalysis;