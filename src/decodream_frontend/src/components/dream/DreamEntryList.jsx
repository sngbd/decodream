import React from "react";
import DreamEntryItem from "./DreamEntryItem";
import DreamSearch from "./DreamSearch";
import { useAuth } from "../../context/AuthContext";
import { useDreams } from "../../context/DreamContext";
import Loading from "../common/Loading";
import "../styles/DreamEntryList.scss";

const DreamEntryList = () => {
  const { isLoggedIn } = useAuth();
  const { dreamEntries, loading, searchQuery } = useDreams();

  if (!isLoggedIn) {
    return null;
  }

  const entriesCount = dreamEntries.length;
  const isSearching = Boolean(searchQuery);

  return (
    <section className="entries-container" aria-labelledby="entries-heading">
      <div className="entries-header">
        <h2 id="entries-heading">Previous Dream Entries</h2>
        <DreamSearch />
      </div>
      
      {loading ? (
        <Loading message="Loading dreams..." />
      ) : entriesCount === 0 ? (
        <p className="no-entries">
          {isSearching 
            ? "No dreams match your search" 
            : "No dream entries yet. Share your dream to get an analysis."}
        </p>
      ) : (
        <div className="entries-list">
          {isSearching && (
            <p className="search-results" aria-live="polite">
              Found {entriesCount} result{entriesCount !== 1 && 's'} for "{searchQuery}"
            </p>
          )}
          
          <ul className="entry-items">
            {dreamEntries.map((entry) => (
              <li key={entry.id || entry.timestamp} className="entry-item-wrapper">
                <DreamEntryItem entry={entry} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DreamEntryList;