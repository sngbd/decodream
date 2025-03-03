import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useDreams } from "../../context/DreamContext";
import ErrorMessage from "../common/ErrorMessage";
import "../styles/DreamForm.scss";
import ConfirmDialog from "../common/ConfirmDialog";
import { decodream_backend as ded } from "../../../../declarations/decodream_backend";

const DreamForm = ({ onAnalysisComplete }) => {
  const [dreamInput, setDreamInput] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [formState, setFormState] = useState("idle");
  const [saveStatus, setSaveStatus] = useState(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const dreamTextareaRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  
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
    setCurrentImage,
    isAnalyzing,
    setIsAnalyzing,
    setIsAnalyzed,
  } = useDreams();

  useEffect(() => {
    if (editingEntry && currentDream) {
      setDreamInput(currentDream);
      setCharCount(currentDream.length);
      setFormState("typing");
    } else {
      setDreamInput('');
      setCharCount(0);
      setFormState("idle");
    }
  }, [editingEntry, currentDream]);

  useEffect(() => {
    if (!isLoggedIn || !dreamInput.trim() || editingEntry) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    if (dreamInput.length > 20) {
      autoSaveTimerRef.current = setTimeout(() => {
        localStorage.setItem('dreamDraft', dreamInput);
        setSaveStatus('Draft saved');
        setTimeout(() => setSaveStatus(null), 2000);
      }, 3000);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [dreamInput, isLoggedIn, editingEntry]);

  useEffect(() => {
    if (isLoggedIn && !editingEntry && !dreamInput) {
      const savedDraft = localStorage.getItem('dreamDraft');
      if (savedDraft) {
        setDreamInput(savedDraft);
        setCharCount(savedDraft.length);
        setFormState(savedDraft.length > 0 ? "typing" : "idle");
      }
    }
  }, [isLoggedIn]);
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDreamInput(value);
    setCharCount(value.length);
    setFormState(value.trim().length > 0 ? "typing" : "idle");
    
    if (error) setError("");
  };
  
  const analyzeDream = async () => {
    if (!isLoggedIn && anonymousAnalysisDone) {
      setError("Please login to analyze more dreams.");
      return;
    }

    if (!dreamInput.trim()) {
      setError("Please enter a dream description.");
      dreamTextareaRef.current.focus();
      return;
    }

    setIsAnalyzing(true);
    setIsAnalyzed(false);
    setError("");
    setFormState("analyzing");

    try {

      const response = await axios.post(
        `${import.meta.env.VITE_AI_APIS_WRAPPER || 'https://mushy-fly-decodream-1db853dd.koyeb.app'}/prompt`,
        {
          content: `
            You are an AI assistant with a deep understanding of dream interpretation and symbolism.
            Your task is to provide me with insightful and meaningful analyses of the symbols, emotions, and narratives present in my dream.
            Offer potential interpretations while encouraging me to reflect on their own experiences and emotions.
            Write it down in Markdown format with headings and bullet points.
            My dream: ${dreamInput}
          `
        },
      );

      const responseImage = await axios.post(
        `${import.meta.env.VITE_AI_APIS_WRAPPER || 'https://mushy-fly-decodream-1db853dd.koyeb.app'}/generate`,
        {
          prompt: `Dreamy and photorealistic illustration of a dream: ${dreamInput}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (responseImage.status !== 200) {
        throw new Error(`Workers AI Wrapper API error: ${responseImage.statusText}`);
      }

      setCurrentImage(responseImage.data.image);

      if (!response.data?.output) {
        throw new Error("Invalid API response");
      }
      
      const analysisContent = response.data.output;
      setCurrentAnalysis(analysisContent);
      setCurrentDream(dreamInput);
      
      if (!isLoggedIn) {
        markAnonymousAnalysisDone();
      } else if (editingEntry) {
        await updateDreamEntry(dreamInput, analysisContent, responseImage.data.image);
        resetEditingState();
        setDreamInput("");
        setCharCount(0);
        localStorage.removeItem('dreamDraft');
      } else {
        await addDreamEntry(dreamInput, analysisContent, responseImage.data.image);
        setDreamInput("");
        setCharCount(0);
        localStorage.removeItem('dreamDraft');
      }
      
      setFormState("complete");
      setIsAnalyzed(true);
      
      if (onAnalysisComplete && typeof onAnalysisComplete === 'function') {
        setTimeout(onAnalysisComplete, 500);
      }
      
    } catch (error) {
      setError("Failed to analyze the dream. Please try again.");
      console.error("Error analyzing dream:", error);
      setFormState("typing");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      analyzeDream();
    }
  };
  
  const handleClearForm = () => {
    if (dreamInput.trim() && !isAnalyzing) {
      setShowConfirmClear(true);
    }
  };

  const confirmClear = () => {
    setIsClearing(true);
    
    setTimeout(() => {
      setDreamInput("");
      setCharCount(0);
      setFormState("idle");
      localStorage.removeItem('dreamDraft');
      setError("");
      setIsClearing(false);
      setShowConfirmClear(false);
    }, 500);
  };

  const cancelClear = () => {
    setShowConfirmClear(false);
  };

  const getDreamQuality = () => {
    if (charCount === 0) return { class: '', text: '' };
    if (charCount < 50) return { class: 'poor', text: 'Too brief for quality analysis' };
    if (charCount < 150) return { class: 'fair', text: 'Basic dream elements present' };
    if (charCount < 300) return { class: 'good', text: 'Good level of detail' };
    return { class: 'excellent', text: 'Excellent detail for deep analysis' };
  };
  
  const dreamQuality = getDreamQuality();

  return (
    <section className="dream-form-container" aria-labelledby="dream-form-title">
      <div className="form-header">
        <h2 id="dream-form-title">
          {editingEntry ? (
            <>Edit Dream <span className="edit-indicator">✏️</span></>
          ) : (
            <>Record Your Dream</>
          )}
        </h2>
        {formState === "typing" && (
          <div className="form-subtitle">
            {editingEntry ? "Make changes to your dream description" : "Capture all the details you can remember"}
          </div>
        )}
      </div>
      
      {error && <ErrorMessage message={error} id="dream-error" />}
      
      <div className="dream-input-wrapper">
        <div className="textarea-container">
          <label htmlFor="dream-textarea" className="dream-label">
            <i className="fas fa-moon"></i>
            <span>Describe your dream in detail</span>
            {dreamInput && (
              <div className={`quality-indicator ${dreamQuality.class}`}>
                {dreamQuality.text}
              </div>
            )}
          </label>
          
          <textarea
            ref={dreamTextareaRef}
            id="dream-textarea"
            placeholder="Describe your dream in as much detail as possible... What happened? Who was there? How did you feel? What unusual elements stood out?"
            value={dreamInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={`dream-textarea ${formState}`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "dream-error" : undefined}
            disabled={isAnalyzing}
            rows="8"
          />
          
          <div className="textarea-footer">
            <div className="char-counter">
              <span className={charCount > 0 ? 'has-content' : ''}>
                {charCount} characters
              </span>
              {saveStatus && (
                <span className="save-status">
                  <i className="fas fa-check-circle"></i> {saveStatus}
                </span>
              )}
            </div>
            
            <div className="keyboard-shortcut">
              <i className="fas fa-keyboard"></i> Ctrl+Enter to analyze
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          {formState !== "idle" && formState !== "analyzing" && (
            <button 
              type="button" 
              onClick={handleClearForm} 
              className="clear-button"
              disabled={isAnalyzing || !dreamInput.trim()}
              aria-label="Clear dream description"
            >
              {isClearing ? (
                <>
                  <div className="spinner small"></div>
                  <span>Clearing...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-times"></i>
                  <span>Clear</span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={analyzeDream}
            disabled={isAnalyzing || (!isLoggedIn && anonymousAnalysisDone) || !dreamInput.trim()}
            className={`submit-button ${formState === "analyzing" ? "analyzing" : ""}`}
            aria-busy={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="spinner"></div>
                <span>Analyzing Dream...</span>
              </>
            ) : editingEntry ? (
              <>
                <i className="fas fa-sync-alt"></i>
                <span>Update & Analyze</span>
              </>
            ) : (
              <>
                <i className="fas fa-brain"></i>
                <span>Analyze Dream</span>
              </>
            )}
          </button>
          
          {editingEntry && (
            <button
              type="button"
              onClick={resetCurrentDream}
              className="cancel-button"
              disabled={isAnalyzing}
            >
              <i className="fas fa-times"></i>
              <span>Cancel</span>
            </button>
          )}
        </div>
      </div>
      
      {!isLoggedIn && !anonymousAnalysisDone && (
        <div className="guest-notice">
          <i className="fas fa-info-circle"></i>
          <p>Using as guest: You can analyze one dream without an account</p>
        </div>
      )}
      
      {!isLoggedIn && anonymousAnalysisDone && !error && (
        <div className="login-prompt">
          <i className="fas fa-lock"></i>
          <div>
            <p>You've used your free dream analysis.</p>
            <a href="/login" className="login-link">Login or create an account</a> to analyze more dreams and build your dream journal.
          </div>
        </div>
      )}

      {
        showConfirmClear &&
        <ConfirmDialog 
          title="Clear Dream Text"
          message="Are you sure you want to clear your dream description? This action cannot be undone."
          confirmText={isClearing ? "Clearing..." : "Yes, Clear It"}
          onConfirm={confirmClear}
          onCancel={cancelClear}
        />
      }  
    </section>
  );
};

export default DreamForm;