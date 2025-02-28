import React, { useState } from "react";
import Markdown from "react-markdown";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamEntryItem.scss";

const DreamEntryItem = ({ entry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { selectDreamForEditing, deleteDreamEntry, setDreamToDelete } = useDreams();

  const handleEdit = () => {
    selectDreamForEditing(entry);
    window.scrollTo(0, 0);
  };

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp)).toLocaleString();
  };

  return (
    <div className="dream-entry-item">
      <div className="entry-header">
        <div className="entry-dates">
          <p className="date-created">
            <strong>Created:</strong> {formatDate(entry.timestamp)}
          </p>
          {entry.lastUpdated && Number(entry.lastUpdated) !== Number(entry.timestamp) && (
            <p className="date-updated">
              <strong>Updated:</strong> {formatDate(entry.lastUpdated)}
            </p>
          )}
        </div>
        <div className="entry-actions">
          <button
            onClick={handleEdit}
            className="edit-button"
          >
            Edit
          </button>
          <button
            onClick={() => setDreamToDelete(entry)}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      </div>
      
      <details open={isOpen}>
        <summary 
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          className="entry-summary"
        >
          {isOpen ? "Hide Dream and Analysis" : "View Dream and Analysis"}
        </summary>
        {isOpen && (
          <div className="entry-content">
            <h3>Dream:</h3>
            <p className="dream-text">{entry.dreamText}</p>
            <h3>Analysis:</h3>
            <div className="analysis-content">
              <Markdown>{entry.analysis}</Markdown>
            </div>
          </div>
        )}
      </details>
    </div>
  );
};

export default DreamEntryItem;