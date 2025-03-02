import React, { useEffect } from 'react';
import DreamForm from './DreamForm';
import DreamAnalysis from './DreamAnalysis';
import DreamEntryList from './DreamEntryList';
import { useDreams } from '../../context/DreamContext';
import '../styles/DreamsPage.scss';

const DreamsPage = () => {
  const { activeTab, setActiveTab } = useDreams();
  const { currentDream, isAnalyzing, isAnalyzed, } = useDreams();
  
  useEffect(() => {
    if (isAnalyzed && !isAnalyzing && currentDream && currentDream.analysis) {
      setActiveTab('analysis');
    }
  }, [isAnalyzing, isAnalyzed, currentDream]);

  return (
    <div className="dreams-page">
      <div className="dreams-navigation">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            <i className="fas fa-feather-alt"></i>
            <span>Write Dream</span>
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'analysis' ? 'active' : ''} ${isAnalyzed ? 'has-content' : 'disabled'}`}
            onClick={() => isAnalyzed && setActiveTab('analysis')}
            disabled={!isAnalyzed}
          >
            <i className="fas fa-brain"></i>
            <span>Analysis</span>
            {isAnalyzing && <div className="pulse-indicator"></div>}
          </button>
          
          <button 
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-book-open"></i>
            <span>Dream Journal</span>
          </button>
        </div>
        
        <div className="progress-indicator">
          <div className={`progress-step ${activeTab === 'write' || activeTab === 'analysis' || activeTab === 'history' ? 'active' : ''}`}>
            <div className="step-circle">1</div>
            <span className="step-label">Record</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${activeTab === 'analysis' || activeTab === 'history' ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span className="step-label">Analyze</span>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${activeTab === 'history' ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Explore</span>
          </div>
        </div>
      </div>

      <div className="dreams-content">
        <div className={`content-panel ${activeTab === 'write' ? 'active' : ''}`}>
          <DreamForm onAnalysisComplete={() => setActiveTab('analysis')} />
          <div className="hint-panel">
            <h3>Recording Your Dream</h3>
            <p>Write down your dream while it's still fresh in your memory. Include as many details as you can remember - emotions, colors, people, places, and any unusual elements.</p>
            <div className="dream-tips">
              <div className="tip">
                <i className="fas fa-lightbulb"></i>
                <p>Record your dream immediately after waking for the most accurate recall</p>
              </div>
              <div className="tip">
                <i className="fas fa-pen-fancy"></i>
                <p>Don't worry about making it perfect - stream of consciousness works best</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`content-panel ${activeTab === 'analysis' ? 'active' : ''}`}>
          <DreamAnalysis />
          {isAnalyzed && (
            <div className="action-panel">
              <p>View this in your dream journal?</p>
              <button 
                className="journal-button"
                onClick={() => setActiveTab('history')}
              >
                <i className="fas fa-journal-whills"></i>
                Dream Journal
              </button>
            </div>
          )}
        </div>
        
        <div className={`content-panel ${activeTab === 'history' ? 'active' : ''}`}>
          <DreamEntryList onWriteDreamClick={() => setActiveTab('write')} />
        </div>
      </div>
    </div>
  );
};

export default DreamsPage;