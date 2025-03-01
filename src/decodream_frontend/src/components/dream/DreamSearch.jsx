import React, { useRef, useEffect } from "react";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamSearch.scss";

const DreamSearch = () => {
  const { searchQuery, setSearchQuery } = useDreams();
  const inputRef = useRef(null);

  const handleClear = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && searchQuery) {
      handleClear();
    }
  };

  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcut);
    return () => {
      document.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, []);

  return (
    <div className="search-container">
      <label htmlFor="dream-search" className="sr-only">
        Search dreams
      </label>
      <input
        id="dream-search"
        ref={inputRef}
        type="text"
        placeholder="Search dreams... (Ctrl+/)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-input"
        aria-label="Search dreams"
      />
      {searchQuery && (
        <button 
          onClick={handleClear}
          className="clear-search"
          aria-label="Clear search"
          title="Clear search"
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </div>
  );
};

export default DreamSearch;