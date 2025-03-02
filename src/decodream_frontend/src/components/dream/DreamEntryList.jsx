import React, { useState, useRef, useEffect } from "react";
import DreamEntryItem from "./DreamEntryItem";
import DreamSearch from "./DreamSearch";
import { useAuth } from "../../context/AuthContext";
import { useDreams } from "../../context/DreamContext";
import Loading from "../common/Loading";
import "../styles/DreamEntryList.scss";
import { decodream_backend as ded } from "../../../../declarations/decodream_backend";

const DreamEntryList = ({ onWriteDreamClick }) => {
  const { isLoggedIn } = useAuth();
  const { dreamEntries, loading, searchQuery } = useDreams();
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [animateEntries, setAnimateEntries] = useState(false);
  const [dreamStatuses, setDreamStatuses] = useState({});
  const [_statusLoading, setStatusLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!loading && dreamEntries.length > 0) {
      setAnimateEntries(true);
    }
  }, [loading, dreamEntries]);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!loading && dreamEntries.length > 0) {
        setStatusLoading(true);
        try {
          const statuses = {};
          
          for (let i = 0; i < dreamEntries.length; i += 10) {
            const batch = dreamEntries.slice(i, i + 10);
            
            const batchPromises = batch.map(async (entry) => {
              const timestamp = typeof entry.timestamp === 'bigint' 
                ? entry.timestamp 
                : BigInt(entry.timestamp);
                
              try {
                const [isShared, isMinted] = await Promise.all([
                  ded.isDreamShared(entry.user, timestamp),
                  ded.isDreamMinted(entry.user, timestamp)
                ]);
                
                return {
                  id: entry.timestamp.toString(),
                  isShared,
                  isMinted
                };
              } catch (error) {
                console.error("Error checking status for entry:", error);
                return {
                  id: entry.timestamp.toString(),
                  isShared: false,
                  isMinted: false
                };
              }
            });
            
            const batchResults = await Promise.all(batchPromises);
            
            batchResults.forEach(result => {
              statuses[result.id] = {
                isShared: result.isShared,
                isMinted: result.isMinted
              };
            });
          }
          
          setDreamStatuses(statuses);
        } catch (error) {
          console.error("Error fetching dream statuses:", error);
        } finally {
          setStatusLoading(false);
          setAnimateEntries(true);
        }
      }
    };

    fetchStatuses();
  }, [loading, dreamEntries]);

  if (!isLoggedIn) {
    return null;
  }

  const entriesCount = dreamEntries.length;
  const isSearching = Boolean(searchQuery);

  const sortedEntries = [...dreamEntries].sort((a, b) => {
    const aTime = typeof a.timestamp === 'bigint' ? a.timestamp.toString() : a.timestamp;
    const bTime = typeof b.timestamp === 'bigint' ? b.timestamp.toString() : b.timestamp;
    
    const aNum = Number(aTime);
    const bNum = Number(bTime);
    
    if (sortOrder === "newest") {
      return bNum - aNum;
    } else {
      return aNum - bNum;
    }
  });

  const filteredEntries = sortedEntries.filter(entry => {
    const entryId = entry.timestamp.toString();
    const status = dreamStatuses[entryId] || { isShared: false, isMinted: false };
    
    if (filterType === "all") return true;
    if (filterType === "shared" && status.isShared) return true;
    if (filterType === "minted" && status.isMinted) return true;
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

  const dreamCounts = dreamEntries.reduce((counts, entry) => {
    const entryId = entry.timestamp.toString();
    const status = dreamStatuses[entryId] || { isShared: false, isMinted: false };
    
    if (status.isShared) counts.shared++;
    if (status.isMinted) counts.minted++;
    return counts;
  }, { shared: 0, minted: 0 });

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
              <i className="fas fa-sort-down"></i>
            </div>
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${filterType === "all" ? "active" : ""}`}
                onClick={() => setFilterType("all")}
              >
                All Dreams <span className="count">{dreamEntries.length}</span>
              </button>
              <button 
                className={`filter-tab ${filterType === "shared" ? "active" : ""}`}
                onClick={() => setFilterType("shared")}
                disabled={dreamCounts.shared === 0}
              >
                Shared <span className="count">{dreamCounts.shared}</span>
              </button>
              <button 
                className={`filter-tab ${filterType === "minted" ? "active" : ""}`}
                onClick={() => setFilterType("minted")}
                disabled={dreamCounts.minted === 0}
              >
                NFT <span className="count">{dreamCounts.minted}</span>
              </button>
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
                  {entries.map((entry, index) => {
                    const entryId = entry.timestamp.toString();
                    const status = dreamStatuses[entryId] || { isShared: false, isMinted: false };
                    const enhancedEntry = {
                      ...entry,
                      isShared: status.isShared,
                      isNFT: status.isMinted
                    };
                    
                    return (
                      <li 
                        key={entry.id || entry.timestamp} 
                        className="entry-item-wrapper"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <DreamEntryItem entry={enhancedEntry} />
                      </li>
                    );
                  })}
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