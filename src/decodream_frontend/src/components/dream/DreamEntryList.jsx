import React, { useState, useRef, useEffect } from "react";
import DreamEntryItem from "./DreamEntryItem";
import DreamSearch from "./DreamSearch";
import { useAuth } from "../../context/AuthContext";
import { useDreams } from "../../context/DreamContext";
import Loading from "../common/Loading";
import "../styles/DreamEntryList.scss";

const DreamEntryList = ({ onWriteDreamClick }) => {
  const { isLoggedIn } = useAuth();
  const { dreamEntries, loading, searchQuery } = useDreams();
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [animateEntries, setAnimateEntries] = useState(false);
  const listRef = useRef(null);

  // Handle entry animations
  useEffect(() => {
    if (!loading && dreamEntries.length > 0) {
      setAnimateEntries(true);
    }
  }, [loading, dreamEntries]);

  if (!isLoggedIn) {
    return null;
  }

  const entriesCount = dreamEntries.length;
  const isSearching = Boolean(searchQuery);

  // Sort entries based on user preference
// Replace your sort function with this:

const sortedEntries = [...dreamEntries].sort((a, b) => {
  // Convert BigInt to string first to avoid type issues
  const aTime = typeof a.timestamp === 'bigint' ? a.timestamp.toString() : a.timestamp;
  const bTime = typeof b.timestamp === 'bigint' ? b.timestamp.toString() : b.timestamp;
  
  // Parse as numbers for comparison
  const aNum = Number(aTime);
  const bNum = Number(bTime);
  
  if (sortOrder === "newest") {
    return bNum - aNum;
  } else {
    return aNum - bNum;
  }
});

  const filteredEntries = sortedEntries.filter(entry => {
    if (filterType === "all") return true;
    if (filterType === "shared" && entry.isShared) return true;
    if (filterType === "minted" && entry.isNFT) return true;
    return false;
  });

  const groupedEntries = filteredEntries.reduce((groups, entry) => {
    const date = new Date(Number(entry.timestamp));
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const groupKey = `${month} ${year}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(entry);
    return groups;
  }, {});

  return (
    <section className="entries-container" aria-labelledby="entries-heading">
      <div className="entries-header">
        <h2 id="entries-heading">
          <i className="fas fa-book-open"></i> Dream Journal
        </h2>
        <div className="entries-actions">
          <DreamSearch />
          <div className="filter-controls">
            <div className="sort-control">
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                aria-label="Sort dreams by"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <i className="fas fa-sort"></i>
            </div>
            <div className="filter-control">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                aria-label="Filter dreams"
              >
                <option value="all">All Dreams</option>
                <option value="shared">Shared</option>
                <option value="minted">NFT Minted</option>
              </select>
              <i className="fas fa-filter"></i>
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <Loading size="lg" message="Retrieving your dreams..." />
        </div>
      ) : entriesCount === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <i className="fas fa-cloud-moon"></i>
          </div>
          <h3>{isSearching ? "No Dreams Found" : "Your Dream Journal Is Empty"}</h3>
          <p>
            {isSearching 
              ? `No dreams match your search "${searchQuery}". Try different keywords or clear your search.` 
              : "Start by recording your dreams to build your personal dream journal. Your entries will appear here."}
          </p>
          {!isSearching && (
            <button className="record-button" onClick={onWriteDreamClick}>
              <i className="fas fa-feather-alt"></i>
              Record Your First Dream
            </button>
          )}
        </div>
      ) : (
        <div className="dream-entries" ref={listRef}>
          {isSearching && (
            <div className="search-results" aria-live="polite">
              <i className="fas fa-search"></i>
              Found <span className="result-count">{entriesCount}</span> dream{entriesCount !== 1 ? 's' : ''} 
              matching "<span className="search-term">{searchQuery}</span>"
            </div>
          )}
          
          {filteredEntries.length === 0 ? (
            <div className="filter-empty-state">
              <i className="fas fa-filter-circle-xmark"></i>
              <p>No dreams match your current filter.</p>
              <button onClick={() => setFilterType("all")}>Show All Dreams</button>
            </div>
          ) : (
            Object.entries(groupedEntries).map(([dateGroup, entries]) => (
              <div key={dateGroup} className="entry-group">
                <div className="group-header">
                  <h3>{dateGroup}</h3>
                  <span className="entry-count">{entries.length} dream{entries.length !== 1 ? 's' : ''}</span>
                </div>
                <ul className={`entry-items ${animateEntries ? 'animate' : ''}`}>
                  {entries.map((entry, index) => (
                    <li 
                      key={entry.id || entry.timestamp} 
                      className="entry-item-wrapper"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <DreamEntryItem entry={entry} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default DreamEntryList;