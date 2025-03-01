import React, { useState } from "react";
import Markdown from "react-markdown";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamEntryItem.scss";

const DreamEntryItem = ({ entry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectDreamForEditing, setDreamToDelete, currentImage } = useDreams();

  const handleEdit = () => {
    selectDreamForEditing(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const toggleOpen = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const entryId = entry.id || entry.timestamp;
  const createdDate = formatDate(entry.timestamp);
  const updatedDate = formatDate(entry.lastUpdated);
  const isUpdated = entry.lastUpdated && Number(entry.lastUpdated) !== Number(entry.timestamp);
  
  // Create unique IDs for ARIA labeling
  const detailsId = `dream-details-${entryId}`;
  const summaryId = `dream-summary-${entryId}`;

  return (
    <article className="dream-entry-item">
      <div className="entry-header">
        <div className="entry-dates">
          {createdDate && (
            <p className="date-created">
              <time dateTime={new Date(Number(entry.timestamp)).toISOString()}>
                <strong>Created:</strong> {createdDate}
              </time>
            </p>
          )}
          {isUpdated && updatedDate && (
            <p className="date-updated">
              <time dateTime={new Date(Number(entry.lastUpdated)).toISOString()}>
                <strong>Updated:</strong> {updatedDate}
              </time>
            </p>
          )}
        </div>
        <div className="entry-actions">
          <button
            onClick={handleEdit}
            className="edit-button"
            aria-label="Edit this dream"
          >
            Edit
          </button>
          <button
            onClick={() => setDreamToDelete(entry)}
            className="delete-button"
            aria-label="Delete this dream"
          >
            Delete
          </button>
        </div>
      </div>
      
      <details 
        open={isOpen} 
        className="entry-details"
        id={detailsId}
      >
        <summary 
          onClick={toggleOpen}
          className="entry-summary"
          id={summaryId}
          aria-expanded={isOpen}
        >
          <span className="summary-text">
            {isOpen ? "Hide Dream and Analysis" : "View Dream and Analysis"}
          </span>
        </summary>
        
        {isOpen && (
          <div className="entry-content">
            <h3>Dream:</h3>
            <p className="dream-text">{entry.dreamText}</p>

            {entry.imageData != "" && (
              <div>
                <h3>Dream Visualization:</h3>
                <div className="entry-image">
                  <img 
                    src={`data:image/png;base64,${entry.imageData}`} 
                    alt="Dream visualization" 
                    className="dream-image"
                  />
                </div>
              </div>
            )}

            <h3>Analysis:</h3>
            <div className="analysis-content">
              <Markdown>{entry.analysis}</Markdown>
            </div>
          </div>
        )}
      </details>
    </article>
  );
};

export default DreamEntryItem;