import React, { createContext, useContext, useState, useEffect } from "react";
import { decodream_backend as ded } from "../../../declarations/decodream_backend";
import { useAuth } from "./AuthContext";

const DreamContext = createContext(null);

export const DreamProvider = ({ children }) => {
  const { isLoggedIn, getPrincipal } = useAuth();
  const [dreamEntries, setDreamEntries] = useState([]);
  const [currentDream, setCurrentDream] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [currentEntryTimestamp, setCurrentEntryTimestamp] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDreamEntries();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (dreamEntries.length > 0 && searchQuery) {
      const filtered = dreamEntries.filter(
        entry => 
          entry.dreamText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.analysis.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries(dreamEntries);
    }
  }, [searchQuery, dreamEntries]);

  const fetchDreamEntries = async () => {
    try {
      setLoading(true);
      const entries = await ded.getDreamEntriesByUser(getPrincipal());
      setDreamEntries(entries);
      setFilteredEntries(entries);
    } catch (err) {
      console.error("Error fetching entries:", err);
      setError("Failed to load dream entries");
    } finally {
      setLoading(false);
    }
  };

  const addDreamEntry = async (dreamText, analysis) => {
    const now = Date.now();
    const timestamp = BigInt(now);
    
    try {
      await ded.addDreamEntry({
        dreamText,
        analysis,
        timestamp,
        user: getPrincipal(),
        lastUpdated: timestamp
      });
      
      setCurrentEntryTimestamp(timestamp);
      setLastUpdated(now);
      await fetchDreamEntries();
      return true;
    } catch (err) {
      console.error("Error adding entry:", err);
      setError("Failed to save dream entry");
      return false;
    }
  };

  const updateDreamEntry = async (dreamText, analysis) => {
    if (!editingEntry) return false;
    
    const now = Date.now();
    try {
      await ded.updateDreamEntry(
        getPrincipal(),
        editingEntry.timestamp,
        dreamText,
        analysis,
        BigInt(now)
      );
      
      setCurrentEntryTimestamp(editingEntry.timestamp);
      setLastUpdated(now);
      await fetchDreamEntries();
      return true;
    } catch (err) {
      console.error("Error updating entry:", err);
      setError("Failed to update dream entry");
      return false;
    }
  };

  const deleteDreamEntry = async (timestamp) => {
    try {
      await ded.deleteDreamEntry(getPrincipal(), timestamp);
      
      if (currentEntryTimestamp === timestamp) {
        resetCurrentDream();
      }
      
      await fetchDreamEntries();
      return true;
    } catch (err) {
      console.error("Error deleting entry:", err);
      setError("Failed to delete dream entry");
      return false;
    }
  };

  const selectDreamForEditing = (entry) => {
    setCurrentDream(entry.dreamText);
    setCurrentAnalysis(entry.analysis);
    setEditingEntry(entry);
    setCurrentEntryTimestamp(entry.timestamp);
    setLastUpdated(entry.lastUpdated ? Number(entry.lastUpdated) : null);
  };

  const resetCurrentDream = () => {
    setCurrentDream("");
    setCurrentAnalysis("");
    setEditingEntry(null);
    setCurrentEntryTimestamp(null);
    setLastUpdated(null);
  };

  const value = {
    dreamEntries: filteredEntries,
    currentDream,
    setCurrentDream,
    currentAnalysis,
    setCurrentAnalysis,
    editingEntry,
    currentEntryTimestamp,
    lastUpdated,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    fetchDreamEntries,
    addDreamEntry,
    updateDreamEntry,
    deleteDreamEntry,
    selectDreamForEditing,
    resetCurrentDream,
  };

  return <DreamContext.Provider value={value}>{children}</DreamContext.Provider>;
};

export const useDreams = () => {
  const context = useContext(DreamContext);
  if (!context) {
    throw new Error("useDreams must be used within a DreamProvider");
  }
  return context;
};