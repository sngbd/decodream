import React, { useState, useEffect } from "react";
import axios from "axios";
import { useInternetIdentity } from "ic-use-internet-identity";
import Markdown from "react-markdown";
import { decodream_backend as ded } from "../../declarations/decodream_backend";

const App = () => {
  const [dreamInput, setDreamInput] = useState("");
  const [dream, setDream] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dreamEntries, setDreamEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [currentEntryTimestamp, setCurrentEntryTimestamp] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [anonymousAnalysisDone, setAnonymousAnalysisDone] = useState(false);
  
  const { identity, login, clear, isAuthenticating } = useInternetIdentity();

  useEffect(() => {
    if (identity) {
      fetchDreamEntries();
    }
    
    const anonAnalysisDone = localStorage.getItem("anonymousAnalysisDone");
    if (anonAnalysisDone === "true") {
      setAnonymousAnalysisDone(true);
    }
  }, [identity]);

  const fetchDreamEntries = async () => {
    try {
      const entries = await ded.getDreamEntriesByUser(identity.getPrincipal().toString());
      setDreamEntries(entries);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  const analyzeDream = async () => {
    if (!identity) {
      if (anonymousAnalysisDone) {
        setError("Please login to analyze more dreams.");
        return;
      }
    }

    if (!dreamInput) {
      setError("Please enter a dream.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          messages: [
            {
              role: "user",
              content: `Analyze this dream in Markdown format with headings and bullet points: ${dreamInput}`
            }
          ],
          model: "deepseek/deepseek-r1-distill-llama-70b:free",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          },
        }
      );

      if (!response.data) {
        throw new Error("API response is missing data");
      }
      
      if (!response.data.choices || !response.data.choices.length) {
        throw new Error("API response is missing choices");
      }
      
      const choice = response.data.choices[0];
      if (!choice.message || !choice.message.content) {
        throw new Error("API response is missing message content");
      }

      const analysisContent = choice.message.content;
      setAnalysis(analysisContent);
      setDream(dreamInput);
      
      const now = Date.now();
      setLastUpdated(now);
      
      if (!identity) {
        setAnonymousAnalysisDone(true);
        localStorage.setItem("anonymousAnalysisDone", "true");
      } else if (editingEntry) {
        await ded.updateDreamEntry(
          identity.getPrincipal().toString(),
          editingEntry.timestamp,
          dreamInput,
          analysisContent,
          BigInt(now)
        );
        setCurrentEntryTimestamp(editingEntry.timestamp);
      } else {
        const timestamp = BigInt(now);
        await ded.addDreamEntry({
          dreamText: dreamInput,
          analysis: analysisContent,
          timestamp: timestamp,
          user: identity.getPrincipal().toString(),
          lastUpdated: timestamp
        });
        setCurrentEntryTimestamp(timestamp);
      }
      
      if (identity) {
        fetchDreamEntries();
      }

      setDreamInput("");
      setEditingEntry(null);
    } catch (error) {
      setError("Failed to analyze the dream. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (entry) => {
    setDreamInput(entry.dreamText);
    setDream(entry.dreamText);
    setAnalysis(entry.analysis);
    setEditingEntry(entry);
    setCurrentEntryTimestamp(entry.timestamp);
    setLastUpdated(entry.lastUpdated ? Number(entry.lastUpdated) : null);
    window.scrollTo(0, 0);
  };
  
  const handleDelete = async (timestamp) => {
    if (confirm("Are you sure you want to delete this dream entry?")) {
      try {
        await ded.deleteDreamEntry(
          identity.getPrincipal().toString(),
          timestamp
        );
        
        if (currentEntryTimestamp === timestamp) {
          setDream("");
          setAnalysis("");
          setEditingEntry(null);
          setCurrentEntryTimestamp(null);
          setLastUpdated(null);
        }
        
        fetchDreamEntries();
      } catch (err) {
        setError("Failed to delete entry");
        console.error("Error deleting entry:", err);
      }
    }
  };
  
  const cancelEdit = () => {
    setDreamInput("");
    setDream("");
    setAnalysis("");
    setEditingEntry(null);
    setCurrentEntryTimestamp(null);
    setLastUpdated(null);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Decodream: Dream Analysis</h1>
        {identity ? (
          <div>
            <span style={{ marginRight: "10px" }}>
              Logged in as: {identity.getPrincipal().toString().substring(0, 8)}...
            </span>
            <button 
              onClick={clear} 
              style={{ padding: "5px 10px" }}
              disabled={isAuthenticating}
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={login} 
            style={{ padding: "10px 20px" }}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? "Connecting..." : "Login with Internet Identity"}
          </button>
        )}
      </div>

      <div style={{ 
        border: "1px solid #e0e0e0", 
        borderRadius: "8px", 
        padding: "20px", 
        marginBottom: "30px",
        backgroundColor: "#f8f9fa"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "15px" 
        }}>
          <h2 style={{ margin: 0 }}>{editingEntry ? "Edit Dream" : "New Dream"}</h2>
        </div>
        
        <textarea
          placeholder="Describe your dream..."
          value={dreamInput}
          onChange={(e) => setDreamInput(e.target.value)}
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            fontSize: "16px",
            marginBottom: "10px",
            borderRadius: "4px",
            border: "1px solid #ced4da"
          }}
        />
        
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={analyzeDream}
            disabled={loading || (!identity && anonymousAnalysisDone)}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: loading || (!identity && anonymousAnalysisDone) ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: loading || (!identity && anonymousAnalysisDone) ? "default" : "pointer",
            }}
          >
            {loading ? "Analyzing..." : editingEntry ? "Update & Analyze" : "Analyze Dream"}
          </button>
          
          {editingEntry && (
            <button
              onClick={cancelEdit}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {error && <p style={{ color: "red", marginTop: "10px", marginBottom: 0 }}>{error}</p>}
        {!identity && anonymousAnalysisDone && !error && (
          <p style={{ color: "#dc3545", marginTop: "10px", marginBottom: 0 }}>
            You've already analyzed one dream. Please login to analyze more dreams.
          </p>
        )}
      </div>

      {analysis && (
        <div style={{ 
          border: "1px solid #d1ecf1", 
          borderRadius: "8px", 
          padding: "20px", 
          marginBottom: "30px",
          backgroundColor: "#d1ecf1",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            marginBottom: "15px" 
          }}>
            <h2 style={{ margin: 0 }}>Current Analysis</h2>
            <div style={{ textAlign: "right" }}>
              {currentEntryTimestamp && (
                <p style={{ margin: 0, color: "#666", fontSize: "0.9em" }}>
                  <strong>Created:</strong> {new Date(Number(currentEntryTimestamp)).toLocaleString()}
                </p>
              )}
              {lastUpdated && (
                <p style={{ margin: 0, color: "#666", fontSize: "0.9em" }}>
                  <strong>Updated:</strong> {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          
          <h3>Dream:</h3>
          <p style={{ whiteSpace: "pre-line" }}>{dream}</p>
          
          <h3>Analysis:</h3>
          <div className="markdown-content" style={{ backgroundColor: "white", padding: "15px", borderRadius: "5px" }}>
            <Markdown>{analysis}</Markdown>
          </div>
        </div>
      )}

      {identity && (
        <div style={{ 
          border: "1px solid #e0e0e0", 
          borderRadius: "8px", 
          padding: "20px",
          backgroundColor: "#f8f9fa" 
        }}>
          <h2>Previous Dream Entries</h2>
          
          {dreamEntries.length === 0 ? (
            <p>No dream entries yet. Share your dream to get an analysis.</p>
          ) : (
            dreamEntries.map((entry, index) => (
              <div key={index} style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "15px", 
                marginBottom: "15px",
                backgroundColor: "white"
              }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "10px"
                }}>
                  <div>
                    <p style={{ margin: 0, color: "#666", fontSize: "0.9em" }}>
                      <strong>Created:</strong> {new Date(Number(entry.timestamp)).toLocaleString()}
                    </p>
                    {entry.lastUpdated && Number(entry.lastUpdated) !== Number(entry.timestamp) && (
                      <p style={{ margin: 0, color: "#666", fontSize: "0.9em" }}>
                        <strong>Updated:</strong> {new Date(Number(entry.lastUpdated)).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleEdit(entry)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.timestamp)}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <details>
                  <summary style={{ 
                    cursor: "pointer", 
                    padding: "8px", 
                    backgroundColor: "#f1f1f1", 
                    borderRadius: "4px",
                    marginBottom: "10px",
                    fontWeight: "bold"
                  }}>
                    View Dream and Analysis
                  </summary>
                  <div style={{ padding: "10px" }}>
                    <h3>Dream:</h3>
                    <p style={{ whiteSpace: "pre-line" }}>{entry.dreamText}</p>
                    <h3>Analysis:</h3>
                    <Markdown>{entry.analysis}</Markdown>
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default App;