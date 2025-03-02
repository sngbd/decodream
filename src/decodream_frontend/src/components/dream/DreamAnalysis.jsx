import React, { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamAnalysis.scss";

const DreamAnalysis = () => {
  const [activeTab, setActiveTab] = useState("analysis");
  const [showInsights, setShowInsights] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const analysisRef = useRef(null);
  const imageRef = useRef(null);
  
  const { 
    currentDream, 
    currentAnalysis, 
    currentEntryTimestamp, 
    updated,
    currentImage,
    isAnalyzing,
  } = useDreams();

  useEffect(() => {
    if (!isAnalyzing && currentAnalysis && analysisRef.current && activeTab === "analysis") {
      setTimeout(() => {
        analysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [isAnalyzing, currentAnalysis, activeTab]);

  useEffect(() => {
    if (showInsights) {
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [showInsights]);

  if (!currentAnalysis && !isAnalyzing) {
    return null;
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(Number(timestamp));
    
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReadTime = () => {
    if (!currentDream) return "< 1 min";
    const words = currentDream.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const extractInsights = () => {
    if (!currentAnalysis) return [];

    const insightKeywords = [
      'symbol', 'theme', 'emotion', 'interpretation', 
      'meaning', 'key element', 'significant', 'represent'
    ];
    
    const lines = currentAnalysis.split('\n');
    const insights = [];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (line.includes('- ') || line.includes('* ')) {
        if (insightKeywords.some(keyword => lowerLine.includes(keyword))) {
          const cleanText = line.replace(/^[-*]\s+/, '').trim();
          if (cleanText.length > 10 && cleanText.length < 120) {
            insights.push(cleanText);
          }
        }
      }
    });
    
    return insights.slice(0, 3);
  };

  const createdDate = formatDate(currentEntryTimestamp);
  const updatedDate = formatDate(updated);
  const readTime = getReadTime();
  const insights = extractInsights();

  return (
    <div className="dream-analysis" aria-labelledby="analysis-title">
      {isAnalyzing && (
        <div className="analysis-loading">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <h3>Analyzing Your Dream</h3>
          <p>Our AI is interpreting your dream symbols and patterns...</p>
          <div className="analysis-progress">
            <div className="progress-animation"></div>
          </div>
        </div>
      )}

      {!isAnalyzing && currentAnalysis && (
        <>
          <div className="analysis-header">
            <div className="title-section">
              <h2 id="analysis-title">Dream Analysis</h2>
              <div className="meta-info">
                <span className="read-time">
                  <i className="fas fa-clock"></i> {readTime}
                </span>
                {createdDate && (
                  <span className="created-date">
                    <i className="fas fa-calendar-alt"></i> {createdDate}
                  </span>
                )}
              </div>
            </div>
            
            {insights.length > 0 && (
              <div className="quick-insights">
                <button 
                  className={`insights-toggle ${showInsights ? 'active' : ''}`}
                  onClick={() => setShowInsights(!showInsights)}
                  aria-expanded={showInsights}
                  aria-controls="insights-panel"
                >
                  <i className={`fas fa-lightbulb ${showInsights ? 'pulse' : ''}`}></i>
                  <span>Key Insights</span>
                </button>
                
                {showInsights && (
                  <div id="insights-panel" className="insights-panel">
                    <h4>Key Dream Elements</h4>
                    <ul>
                      {insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="analysis-tabs">
            <button 
              className={`analysis-tab ${activeTab === 'dream' ? 'active' : ''}`}
              onClick={() => setActiveTab('dream')}
              aria-selected={activeTab === 'dream'}
            >
              <i className="fas fa-feather-alt"></i>
              <span>Dream</span>
            </button>
            
            {currentImage && currentImage !== "" && (
              <button 
                className={`analysis-tab ${activeTab === 'visualization' ? 'active' : ''}`}
                onClick={() => setActiveTab('visualization')}
                aria-selected={activeTab === 'visualization'}
              >
                <i className="fas fa-image"></i>
                <span>Visualization</span>
              </button>
            )}
            
            <button 
              className={`analysis-tab ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => setActiveTab('analysis')}
              aria-selected={activeTab === 'analysis'}
            >
              <i className="fas fa-brain"></i>
              <span>Analysis</span>
            </button>
          </div>
          
          <div className="analysis-content">
            {
              (activeTab === 'dream') ?
                (
                  <div className="dream-content">
                    <h3 className="section-title">
                      <i className="fas fa-moon"></i> Your Dream
                    </h3>
                    <div className="dream-text">
                      {currentDream.split('\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ) :
              (activeTab === 'visualization') ?
                (
                  <div className="dream-image-section" ref={imageRef}>
                    <h3 className="section-title">
                      <i className="fas fa-paint-brush"></i> Dream Visualization
                    </h3>
                    <div 
                      className={`dream-image-container ${isImageZoomed ? 'zoomed' : ''}`}
                      onClick={() => setIsImageZoomed(!isImageZoomed)}
                    >
                      <img 
                        src={`data:image/png;base64,${currentImage}`} 
                        alt="Dream visualization"
                        className="dream-image"
                      />
                      <div className="zoom-instruction">
                        <i className="fas fa-search-plus"></i>
                        <span>Click to {isImageZoomed ? 'minimize' : 'enlarge'}</span>
                      </div>
                    </div>
                  </div>
                ) :
                (
                  <div className="markdown-content" ref={analysisRef}>
                    <h3 className="section-title">
                      <i className="fas fa-brain"></i> Dream Interpretation
                    </h3>
                    <div className="markdown-content">
                      <Markdown>{currentAnalysis}</Markdown>
                    </div>
                  </div>
                )
            }
            
          </div>
          
          <div className="analysis-footer">
            <div className="timestamp-info" aria-live="polite">
              {updatedDate && updated !== currentEntryTimestamp && (
                <p className="updated-timestamp">
                  <i className="fas fa-edit"></i>
                  <time dateTime={new Date(Number(updated)).toISOString()}>
                    Last updated: {updatedDate}
                  </time>
                </p>
              )}
            </div>
            
          </div>
        </>
      )}
    </div>
  );
};

export default DreamAnalysis;