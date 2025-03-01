import React, { useState, useEffect } from "react";
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
    resetCurrentDream,
    resetEditingState,
    currentImage,
    setCurrentImage,
  } = useDreams();

  useEffect(() => {
    if (editingEntry && currentDream) {
      setDreamInput(currentDream);
    } else {
      setDreamInput('');
    }
  }, [editingEntry, currentDream]);

  const analyzeDream = async () => {
    if (!isLoggedIn && anonymousAnalysisDone) {
      setError("Please login to analyze more dreams.");
      return;
    }

    if (!dreamInput.trim()) {
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
              content: `(Note: Do not show the Chain of Thought) Analyze and interpret this dream in Markdown format with headings and bullet points: ${dreamInput}`
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


      const responseImage = await axios.post(
        `${import.meta.env.VITE_WORKERS_AI || 'http://localhost:3000'}/generate`,
        {
          prompt: `Generate a photorealistic illustration of the following dream: ${dreamInput}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (responseImage.status != 200) {
        throw new Error(`Workers AI Wrapper API error: ${responseImage.statusText}`);
      }

      setCurrentImage(responseImage.data.image);

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error("Invalid API response");
      }
      
      const analysisContent = response.data.choices[0].message.content;
      setCurrentAnalysis(analysisContent);
      setCurrentDream(dreamInput);
      
      if (!isLoggedIn) {
        markAnonymousAnalysisDone();
      } else if (editingEntry) {
        await updateDreamEntry(dreamInput, analysisContent, responseImage.data.image);
        resetEditingState();
        setDreamInput("");
      } else {
        console.log(currentImage);
        await addDreamEntry(dreamInput, analysisContent, responseImage.data.image);
        setDreamInput("");
      }
    } catch (error) {
      setError("Failed to analyze the dream. Please try again.");
      console.error("Error analyzing dream:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      analyzeDream();
    }
  };

  return (
    <section className="dream-form-container" aria-labelledby="dream-form-title">
      <div className="form-header">
        <h2 id="dream-form-title">{editingEntry ? "Edit Dream" : "New Dream"}</h2>
      </div>
      
      <label htmlFor="dream-textarea" className="sr-only">
        Describe your dream
      </label>
      <textarea
        id="dream-textarea"
        placeholder="Describe your dream..."
        value={dreamInput}
        onChange={(e) => setDreamInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="dream-textarea"
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? "dream-error" : undefined}
        disabled={isAnalyzing}
        rows="6"
      />

      <div className="button-group">
        <button
          type="button"
          onClick={analyzeDream}
          disabled={isAnalyzing || (!isLoggedIn && anonymousAnalysisDone) || !dreamInput.trim()}
          className="analyze-button"
          aria-busy={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : editingEntry ? "Update & Analyze" : "Analyze Dream"}
        </button>
        
        {editingEntry && (
          <button
            type="button"
            onClick={resetCurrentDream}
            className="cancel-button"
            disabled={isAnalyzing}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} id="dream-error" />}
      
      {!isLoggedIn && anonymousAnalysisDone && !error && (
        <p className="anonymous-warning" role="alert">
          You've already analyzed one dream. Please login to analyze more dreams.
        </p>
      )}

      <p className="keyboard-shortcut">
        <small>Tip: Press Ctrl+Enter to analyze your dream</small>
      </p>
    </section>
  );
};

export default DreamForm;