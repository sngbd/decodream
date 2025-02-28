import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useDreams } from "../../context/DreamContext";
import ErrorMessage from "../common/ErrorMessage";
import "../styles/DreamForm.scss";

const DreamForm = () => {
  const [dreamInput, setDreamInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { 
    isLoggedIn, 
    anonymousAnalysisDone, 
    markAnonymousAnalysisDone 
  } = useAuth();
  
  const { 
    currentDream, 
    setCurrentDream,
    setCurrentAnalysis,
    editingEntry,
    error, 
    setError,
    addDreamEntry,
    updateDreamEntry,
    resetCurrentDream
  } = useDreams();

  const analyzeDream = async () => {
    if (!isLoggedIn && anonymousAnalysisDone) {
      setError("Please login to analyze more dreams.");
      return;
    }

    if (!dreamInput) {
      setError("Please enter a dream.");
      return;
    }

    setIsAnalyzing(true);
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

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response");
      }
      
      const analysisContent = response.data.choices[0].message.content;
      setCurrentAnalysis(analysisContent);
      setCurrentDream(dreamInput);
      
      if (!isLoggedIn) {
        markAnonymousAnalysisDone();
      } else if (editingEntry) {
        await updateDreamEntry(dreamInput, analysisContent);
      } else {
        await addDreamEntry(dreamInput, analysisContent);
      }

      setDreamInput("");
    } catch (error) {
      setError("Failed to analyze the dream. Please try again.");
      console.error("Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="dream-form-container">
      <div className="form-header">
        <h2>{editingEntry ? "Edit Dream" : "New Dream"}</h2>
      </div>
      
      <textarea
        placeholder="Describe your dream..."
        value={dreamInput}
        onChange={(e) => setDreamInput(e.target.value)}
        className="dream-textarea"
      />
      
      <div className="button-group">
        <button
          onClick={analyzeDream}
          disabled={isAnalyzing || (!isLoggedIn && anonymousAnalysisDone)}
          className="analyze-button"
        >
          {isAnalyzing ? "Analyzing..." : editingEntry ? "Update & Analyze" : "Analyze Dream"}
        </button>
        
        {editingEntry && (
          <button
            onClick={resetCurrentDream}
            className="cancel-button"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}
      
      {!isLoggedIn && anonymousAnalysisDone && !error && (
        <p className="anonymous-warning">
          You've already analyzed one dream. Please login to analyze more dreams.
        </p>
      )}
    </div>
  );
};

export default DreamForm;