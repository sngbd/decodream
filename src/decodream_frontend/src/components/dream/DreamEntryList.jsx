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

  return (
    <div className="entries-container">
      <div className="entries-header">
        <h2>Previous Dream Entries</h2>
        <DreamSearch />
      </div>
      
      {loading ? (
        <Loading message="Loading dreams..." />
      ) : dreamEntries.length === 0 ? (
        <p>{searchQuery ? "No dreams match your search" : "No dream entries yet. Share your dream to get an analysis."}</p>
      ) : (
        <>
          {searchQuery && (
            <p className="search-results">Found {dreamEntries.length} results for "{searchQuery}"</p>
          )}
          {dreamEntries.map((entry, index) => (
            <DreamEntryItem key={index} entry={entry} />
          ))}
        </>
      )}
    </div>
  );
};

export default DreamEntryList;