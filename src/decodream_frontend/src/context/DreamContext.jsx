import React, { createContext, useContext, useState, useEffect } from "react";
import { decodream_backend as ded } from "../../../declarations/decodream_backend";
import { useAuth } from "./AuthContext";

const DreamContext = createContext({
  activeTab: 'write',
  setActiveTab: () => {},
});

export const DreamProvider = ({ children }) => {
  const { isLoggedIn, getPrincipal } = useAuth();
  const [activeTab, setActiveTab] = useState('write');
  const [dreamEntries, setDreamEntries] = useState([]);
  const [currentDream, setCurrentDream] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [currentEntryTimestamp, setCurrentEntryTimestamp] = useState(null);
  const [updated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [dreamToDelete, setDreamToDelete] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

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

  const addDreamEntry = async (dreamText, analysis, imageData) => {
    const now = Date.now();
    const timestamp = BigInt(now);
    
    try {
      await ded.addDreamEntry({
        dreamText,
        analysis,
        timestamp,
        user: getPrincipal(),
        created: timestamp,
        updated: timestamp,
        imageData
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

  const updateDreamEntry = async (dreamText, analysis, imageData) => {
    if (!editingEntry) return false;
    
    const now = Date.now();
    try {
      await ded.updateDreamEntry(
        getPrincipal(),
        editingEntry.timestamp,
        dreamText,
        analysis,
        BigInt(now),
        imageData
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

  const isDreamShared = async (principalId, timestamp) => {
    try {
      return await ded.isDreamShared(principalId, timestamp);
    } catch (err) {
      console.error("Error checking shared entry:", err);
      setError("Failed to check shared dream entry");
      return false;
    }
  };

  const isDreamMinted = async (principalId, timestamp) => {
    try {
      return await ded.isDreamMinted(principalId, timestamp);
    } catch (err) {
      console.error("Error checking minted entry:", err);
      setError("Failed to check minted dream entry");
      return false;
    }
  };

  const revokeDreamShare = async (principalId, timestamp) => {
    try {
      return await ded.revokeDreamShare(principalId, timestamp);
    } catch (err) {
      console.error("Error revoke dream entry:", err);
      setError("Failed to revoke shared dream entry");
      return false;
    }
  };

  const createShareableLink = async (principalId, timestamp) => {
    try {
      return await ded.createShareableLink(principalId, timestamp);
    } catch (err) {
      console.error("Error create shareable link:", err);
      setError("Failed to create shareable link");
      return [];
    }
  };

  const mintDreamNFT = async (principalId, timestamp, description) => {
    try {
      return await ded.mintDreamNFT(principalId, timestamp, description);
    } catch (err) {
      console.error("Error mint nft:", err);
      setError("Failed to mint nft");
      return null;
    }
  };

  const burnDreamNFT = async (principalId, timestamp) => {
    try {
      return await ded.burnDreamNFT(principalId, timestamp);
    } catch (err) {
      console.error("Error burn nft:", err);
      setError("Failed to burn nft");
      return false;
    }
  };

  const isGalleryPublic = async (principalId) => {
    try {
      return await ded.isGalleryPublic(principalId);
    } catch (err) {
      console.error("Error burn nft:", err);
      setError("Failed to burn nft");
      return "";
    }
  };

  const getMyDreamNFTs = async (principalId) => {
    try {
      return await ded.getMyDreamNFTs(principalId);
    } catch (err) {
      console.error("Error get nfts:", err);
      setError("Failed to get nfts");
      return [];
    }
  };

  const toggleGallerySharing = async (principalId, isPublic) => {
    try {
      return await ded.toggleGallerySharing(principalId, isPublic);
    } catch (err) {
      console.error("Error toggle gallery sharing:", err);
      setError("Failed to toggle gallery sharing");
      return false;
    }
  };

  const getPublicGallery = async (principalId) => {
    try {
      return await ded.getPublicGallery(principalId);
    } catch (err) {
      console.error("Error get public gallery:", err);
      setError("Failed to get public gallery");
      return [];
    }
  };

  const getSharedDream = async (shareId) => {
    try {
      return await ded.getSharedDream(shareId);
    } catch (err) {
      console.error("Error get shared dream:", err);
      setError("Failed to get shared dream");
      return null;
    }
  };

  const selectDreamForEditing = (entry) => {
    setCurrentDream(entry.dreamText);
    setCurrentAnalysis(entry.analysis);
    setEditingEntry(entry);
    setCurrentEntryTimestamp(entry.timestamp);
    setLastUpdated(entry.updated ? Number(entry.updated) : null);
    setCurrentImage(entry.imageData);
  };

  const resetCurrentDream = () => {
    setActiveTab('write');
    setIsAnalyzing(false);
    setIsAnalyzed(false);
    setCurrentDream("");
    setCurrentAnalysis("");
    setCurrentImage('');
    setEditingEntry(null);
    setCurrentEntryTimestamp(null);
    setLastUpdated(null);
  };

  const resetEditingState = () => {
    setEditingEntry(null);
  };

  const clearDreamToDelete = () => {
    setDreamToDelete(null);
  };

  const value = {
    dreamEntries: filteredEntries,
    activeTab,
    setActiveTab,
    currentDream,
    setCurrentDream,
    resetEditingState,
    currentAnalysis,
    setCurrentAnalysis,
    editingEntry,
    currentEntryTimestamp,
    updated,
    loading,
    error,
    setError,
    searchQuery,
    setSearchQuery,
    fetchDreamEntries,
    addDreamEntry,
    updateDreamEntry,
    deleteDreamEntry,
    isDreamShared,
    isDreamMinted,
    revokeDreamShare,
    createShareableLink,
    mintDreamNFT,
    burnDreamNFT,
    isGalleryPublic,
    getMyDreamNFTs,
    getPublicGallery,
    toggleGallerySharing,
    getSharedDream,
    selectDreamForEditing,
    resetCurrentDream,
    dreamToDelete,
    setDreamToDelete,
    clearDreamToDelete,
    currentImage,
    setCurrentImage,
    isAnalyzing,
    setIsAnalyzing,
    isAnalyzed,
    setIsAnalyzed,
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