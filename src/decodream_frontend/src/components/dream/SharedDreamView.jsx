import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import Loading from '../common/Loading';
import { decodream_backend as ded } from '../../../../declarations/decodream_backend';
import '../styles/SharedDreamView.scss';

const SharedDreamView = () => {
  const { shareId } = useParams();
  const [dream, setDream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedDream = async () => {
      try {
        setLoading(true);
        const result = await ded.getSharedDream(shareId);
        
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
    
    const date = new Date(Number(timestamp));
    
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <time dateTime={new Date(Number(dream.timestamp)).toISOString()}>
              <strong>Created:</strong> {formatDate(dream.timestamp)}
            </time>
          </p>
          {Number(dream.lastUpdated) !== Number(dream.timestamp) && (
            <p>
              <time dateTime={new Date(Number(dream.lastUpdated)).toISOString()}>
                <strong>Updated:</strong> {formatDate(dream.lastUpdated)}
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
          <Markdown>{dream.analysis}</Markdown>
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