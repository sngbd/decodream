import React, { useState, useEffect } from "react";
import axios from "axios";
import { useInternetIdentity } from "ic-use-internet-identity";
import Markdown from "react-markdown";
import { decodream_backend as ded } from "../../declarations/decodream_backend";

const App = () => {
  const [dream, setDream] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dreamEntries, setDreamEntries] = useState([]);
  
  const { identity, login, logout, isAuthenticating } = useInternetIdentity();

  useEffect(() => {
    if (identity) {
      fetchDreamEntries();
    }
  }, [identity]);

  const fetchDreamEntries = async () => {
    try {
      const entries = await ded.getDreamEntries();
      setDreamEntries(entries);
    } catch (err) {
      console.error("Error fetching entries:", err);
    }
  };

  const analyzeDream = async () => {
    if (!identity) {
      setError("Please login first.");
      return;
    }

    if (!dream) {
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
              content: `Analyze this dream in Markdown format with headings and bullet points: ${dream}`
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

      const analysisContent = response.data.choices[0].message.content;
      setAnalysis(analysisContent);
      
      await ded.addDreamEntry({
        dreamText: dream,
        analysis: analysisContent,
        timestamp: BigInt(Date.now()),
        user: identity.getPrincipal().toString()
      });

      fetchDreamEntries();
    } catch (error) {
      setError("Failed to analyze the dream. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
              onClick={logout} 
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

      {identity && (
        <>
          <textarea
            placeholder="Describe your dream..."
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            style={{
              width: "100%",
              height: "150px",
              padding: "10px",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          />
          <button
            onClick={analyzeDream}
            disabled={loading}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {loading ? "Analyzing..." : "Analyze Dream"}
          </button>

          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

          {analysis && (
            <div style={{ marginTop: "20px" }}>
              <h2>Analysis</h2>
              <div className="markdown-content">
                <Markdown>{analysis}</Markdown>
              </div>
            </div>
          )}

          <div style={{ marginTop: "40px" }}>
            <h2>Previous Entries</h2>
            {dreamEntries.map((entry, index) => (
              <div key={index} style={{ 
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "15px", 
                marginBottom: "15px",
                backgroundColor: "#f9f9f9"
              }}>
                <p style={{ color: "#666", fontSize: "0.9em" }}>
                  {new Date(Number(entry.timestamp)).toLocaleString()}
                </p>
                <h3>Dream:</h3>
                <p>{entry.dreamText}</p>
                <h3>Analysis:</h3>
                <Markdown>{entry.analysis}</Markdown>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;