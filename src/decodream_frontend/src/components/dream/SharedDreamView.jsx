import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDreams } from "../../context/DreamContext";
import Markdown from 'react-markdown';
import Loading from '../common/Loading';
import '../styles/SharedDreamView.scss';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const SharedDreamView = () => {
  const { shareId } = useParams();
  const { getSharedDream } = useDreams();

  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedDream = async () => {
      try {
        setLoading(true);
        const result = await getSharedDream(shareId);
        
        if (result.length === 0) {
          setError('This shared dream does not exist or has been removed.');
        } else {
          setDream(result[0]);
        }
      } catch (err) {
        console.error('Error fetching shared dream:', err);
        setError('Could not load the shared dream. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDream();
  }, [shareId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      let dateValue;
      if (typeof timestamp === 'bigint') {
        dateValue = Number(timestamp);
      } else if (typeof timestamp === 'string') {
        dateValue = parseInt(timestamp, 10);
      } else {
        dateValue = Number(timestamp);
      }
      
      if (dateValue > 1e15) {
        dateValue = dateValue / 1000000;
      } else if (dateValue < 1e10) {
        dateValue = dateValue * 1000;
      }
      
      const date = new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date format';
    }
  };

  const safeISOString = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      let dateValue;
      if (typeof timestamp === 'bigint') {
        dateValue = Number(timestamp);
      } else if (typeof timestamp === 'string') {
        dateValue = parseInt(timestamp, 10);
      } else {
        dateValue = Number(timestamp);
      }
      
      if (dateValue > 1e15) {
        dateValue = dateValue / 1000000;
      } else if (dateValue < 1e10) {
        dateValue = dateValue * 1000;
      }
      
      const date = new Date(dateValue);
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toISOString();
    } catch (e) {
      console.error('Error formatting ISO date:', e);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="shared-dream-container loading">
        <Loading size="lg" />
        <p>Loading shared dream...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-dream-container error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="return-home">Return to homepage</Link>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="shared-dream-container not-found">
        <h2>Dream Not Found</h2>
        <p>The shared dream you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="return-home">Return to homepage</Link>
      </div>
    );
  }

  return (
    <div className="shared-dream-container">
      <div className="shared-dream-header">
        <h2>Shared Dream</h2>
        <div className="timestamp-info">
          <p>
            <time dateTime={safeISOString(dream.created)}>
              <strong>Created:</strong> {formatDate(dream.created)}
            </time>
          </p>
          {dream.updated && dream.created && Number(dream.updated) !== Number(dream.created) && (
            <p>
              <time dateTime={safeISOString(dream.updated)}>
                <strong>Updated:</strong> {formatDate(dream.updated)}
              </time>
            </p>
          )}
        </div>
      </div>
      
      <div className="shared-dream-content">
        <h3>Dream:</h3>
        <p className="dream-text">{dream.dreamText}</p>

        {dream.imageData && dream.imageData !== "" && (
          <div className="dream-image-section">
            <h3>Dream Visualization</h3>
            <img 
              src={`data:image/png;base64,${dream.imageData}`} 
              alt="Dream visualization"
              className="dream-image"
            />
          </div>
        )}
        
        <h3>Analysis:</h3>
        <div className="markdown-content">
          <Markdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {dream.analysis}
          </Markdown>
        </div>
      </div>
      
      <div className="shared-dream-footer">
        <p>Want to analyze and visualize your own dreams?</p>
        <Link to="/" className="cta-button">Try Decodream</Link>
      </div>
    </div>
  );
};

export default SharedDreamView;