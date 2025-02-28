import React from "react";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamSearch.scss";

const DreamSearch = () => {
  const { searchQuery, setSearchQuery } = useDreams();

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search dreams..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery("")}
          className="clear-search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default DreamSearch;