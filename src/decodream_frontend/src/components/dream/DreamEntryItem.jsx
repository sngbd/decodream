import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Markdown from "react-markdown";
import { useDreams } from "../../context/DreamContext";
import "../styles/DreamEntryItem.scss";
import { decodream_backend as ded } from '../../../../declarations/decodream_backend';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const DreamEntryItem = ({ entry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [contentHeight, setContentHeight] = useState("0px");
  const { selectDreamForEditing, setDreamToDelete, setIsAnalyzed, setActiveTab } = useDreams();
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [shareError, setShareError] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState('');
  const [clipboardStatus, setClipboardStatus] = useState('');
  const [imageZoomed, setImageZoomed] = useState(false);

  const [isCurrentlyShared, setIsCurrentlyShared] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  
  const contentRef = useRef(null);
  const notificationTimerRef = useRef(null);
  const entryRef = useRef(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const timestampForShare = parseInt(entry.timestamp, 10);
        const timestampForMint = parseInt(entry.timestamp, 10);
        
        const [isShared, isMinted] = await Promise.all([
          ded.isDreamShared(entry.user, timestampForShare),
          ded.isDreamMinted(entry.user, timestampForMint)
        ]);
        
        setIsCurrentlyShared(isShared);
        setIsMinted(isMinted);
      } catch (error) {
        console.error("Error checking dream status:", error);
      }
    };
    
    checkStatus();
  }, [entry]);

  const handleShare = async (e) => {
    e.stopPropagation();
    
    if (isCurrentlyShared) {
      try {
        setIsUnsharing(true);
        setShareError('');
        
        const result = await ded.revokeDreamShare(entry.user, entry.timestamp);
        
        if (result) {
          setIsCurrentlyShared(false);
          setShareLink('');
        } else {
          setShareError('Failed to revoke sharing. Please try again.');
        }
      } catch (error) {
        console.error('Error unsharing dream:', error);
        setShareError('Failed to revoke sharing: ' + (error.message || 'Unknown error'));
      } finally {
        setIsUnsharing(false);
      }
    } else {
      try {
        setIsSharing(true);
        setShareError('');
        setShareLink('');
        
        const result = await ded.createShareableLink(entry.user, entry.timestamp);
        
        if (result.length === 0) {
          setShareError('Could not create share link. Please try again.');
          return;
        }
        
        const shareId = result[0];
        const shareUrl = `${window.location.origin}/shared/${shareId}`;
        setShareLink(shareUrl);
        setIsCurrentlyShared(true);
        
        try {
          await navigator.clipboard.writeText(shareUrl);
          setClipboardStatus('Copied to clipboard!');
          setTimeout(() => setClipboardStatus(''), 2000);
        } catch (clipboardError) {
          console.log('Auto-copy failed, user may need to copy manually', clipboardError);
          setClipboardStatus('Click to copy');
        }
      } catch (error) {
        console.error('Error creating share link:', error);
        setShareError('Failed to create share link. Please try again.');
      } finally {
        setIsSharing(false);
      }
    }
  };

  const handleMintNFT = async (e) => {
    e.stopPropagation();
    
    if (isMinted) {
      try {
        setIsBurning(true);
        setMintError('');
        
        const timestampInt = parseInt(entry.timestamp, 10);
        
        const result = await ded.burnDreamNFT(entry.user, timestampInt);
        
        if (result) {
          setIsMinted(false);
        } else {
          setMintError('Failed to burn NFT. Please try again later.');
        }
      } catch (error) {
        console.error('Error burning NFT:', error);
        setMintError('Failed to burn NFT: ' + (error.message || 'Unknown error'));
      } finally {
        setIsBurning(false);
      }
    } else {
      try {
        setIsMinting(true);
        setMintError('');
        setMintSuccess(false);
        
        const timestampInt = parseInt(entry.timestamp, 10);
        const dateStr = new Date(Number(entry.timestamp)).toLocaleDateString();
        
        const result = await ded.mintDreamNFT(
          entry.user,
          timestampInt,
          `Dream visualization from ${dateStr}`
        );
        
        if (result === null || result === undefined) {
          setMintError('Could not mint NFT. Please try again later.');
          return;
        }
        
        setIsMinted(true);
        setMintSuccess(true);
      } catch (error) {
        console.error('Error minting NFT:', error);
        setMintError('Failed to mint NFT: ' + (error.message || 'Unknown error'));
      } finally {
        setIsMinting(false);
      }
    }
  };

  const handleEdit = () => {
    if (isMinted) {
      setMintError('This dream cannot be edited because it has been minted as an NFT. Burn the NFT first to edit.');
      return;
    }
    
    selectDreamForEditing(entry);
    setIsAnalyzed(true);
    setActiveTab('write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMintedDeleteAttempt = () => {
    setMintError('This dream cannot be deleted because it has been minted as an NFT. Burn the NFT first to delete.');
  };

  const toggleOpen = (e) => {
    e.preventDefault();
    
    if (isOpen) {
      setIsCollapsing(true);
      setIsOpen(false);
      
      setTimeout(() => {
        setIsCollapsing(false);
      }, 300);
    } else {
      setIsExpanding(true);
      setIsOpen(true);
      
      setTimeout(() => {
        setIsExpanding(false);
        if (entryRef.current) {
          const rect = entryRef.current.getBoundingClientRect();
          if (rect.top < 80 || rect.bottom > window.innerHeight) {
            entryRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center'
            });
          }
        }
      }, 300);
    }
  };

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setContentHeight("0px");
    }
  }, [isOpen, entry]);

  useEffect(() => {
    if (shareLink || shareError || mintSuccess || mintError) {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      
      const dismissTime = shareLink || mintSuccess ? 12000 : 6000;
      
      notificationTimerRef.current = setTimeout(() => {
        if (shareError) {
          setShareError('');
        }
        if (mintError) {
          setMintError('');
        }
        if (mintSuccess) {
          setMintSuccess(false);
        }
      }, dismissTime); 
    }
    
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
    };
  }, [shareLink, shareError, mintSuccess, mintError]);

  const dismissNotification = (type) => {
    if (type === 'share') {
      setShareLink('');
      setShareError('');
    } else if (type === 'mint') {
      setMintSuccess(false);
      setMintError('');
    }
  };

  const handleCopyClick = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareLink);
      setClipboardStatus('Copied to clipboard!');
      setTimeout(() => setClipboardStatus(''), 2000);
    } catch (error) {
      const tempInput = document.createElement('input');
      tempInput.value = shareLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      
      try {
        document.execCommand('copy');
        setClipboardStatus('Copied to clipboard!');
      } catch (err) {
        setClipboardStatus('Please copy manually');
      }
      
      document.body.removeChild(tempInput);
      setTimeout(() => setClipboardStatus(''), 2000);
    }
  };

  const toggleImageZoom = (e) => {
    e.stopPropagation();
    setImageZoomed(!imageZoomed);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(Number(timestamp));
    
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDreamPreview = () => {
    if (!entry.dreamText) return "";
    
    const maxLength = 120;
    const text = entry.dreamText.trim();
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + "...";
  };

  const formatDreamDate = (timestamp) => {
    if (!timestamp) return null;
    
    const date = new Date(Number(timestamp));
    
    if (isNaN(date.getTime())) return null;
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const createdDate = formatDate(entry.created);
  const updatedDate = formatDate(entry.updated);
  const isUpdated = entry.updated && Number(entry.updated) !== Number(entry.timestamp);
  const headerDate = formatDreamDate(entry.timestamp);
  const dreamPreview = getDreamPreview();
  
  const hasVisualizations = entry.imageData && entry.imageData !== "";
  const hasAnalysis = entry.analysis && entry.analysis !== "";
  
  const dreamTitle = entry.dreamText && entry.dreamText.split(/\n|\.\s+/)[0].trim();
  const displayTitle = dreamTitle && dreamTitle.length > 3 && dreamTitle.length < 80 
    ? dreamTitle 
    : "Dream Entry";

  return (
    <article 
      className={`dream-entry-item ${isOpen ? 'expanded' : ''} ${isExpanding ? 'expanding' : ''} ${isCollapsing ? 'collapsing' : ''} ${isMinted ? 'is-minted' : ''}`} 
      ref={entryRef}
    >
      <div className="entry-card">
        <div 
          className="entry-header" 
          role="button" 
          onClick={toggleOpen} 
          tabIndex={0} 
          aria-expanded={isOpen}
        >
          <div className="entry-header-content">
            <h3 className="entry-title">
              {displayTitle}
              <span className="toggle-indicator">
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
              </span>
            </h3>
            
            <p className="entry-date">
              <i className="far fa-calendar-alt"></i> {headerDate}
            </p>

            {!isOpen && (
              <p className="entry-preview">{dreamPreview}</p>
            )}
          </div>

          <div className="entry-tags">
            
            {entry.isNFT && (
              <span className="entry-tag is-nft" title="This dream has been minted as an NFT">
                <i className="fas fa-gem"></i> NFT
              </span>
            )}
            
            {isUpdated && (
              <span className="entry-tag is-edited" title="This dream has been edited">
                <i className="fas fa-edit"></i> Edited
              </span>
            )}
          </div>
        </div>
        
        <div 
          className="entry-content-wrapper" 
          style={{ height: contentHeight }}
          aria-hidden={!isOpen}
        >
          <div className="entry-content" ref={contentRef}>
            <div className="content-section">
              <h4>Dream</h4>
              <div className="dream-text">
                {entry.dreamText.split('\n').map((paragraph, idx) => (
                  paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                ))}
              </div>
              
              {hasVisualizations && (
                <div className="visualization-section">
                  <h4>Dream Visualization</h4>
                  <div className={`dream-image-container ${imageZoomed ? 'zoomed' : ''}`}>
                    <img 
                      src={`data:image/png;base64,${entry.imageData}`} 
                      alt="Dream visualization"
                      className="dream-image"
                      onClick={toggleImageZoom}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <button className="zoom-button" onClick={toggleImageZoom} aria-label="Zoom image">
                        <i className={`fas ${imageZoomed ? 'fa-compress' : 'fa-expand'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {hasAnalysis && (
                <div className="analysis-section">
                  <h4>Analysis</h4>
                  <div className="analysis-content">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {entry.analysis}
                    </Markdown>
                  </div>
                </div>
              )}
            </div>
            
            <div className="entry-footer">
              <div className="entry-metadata">
                <div className="timestamp-info">
                  {createdDate && (
                    <p className="date-created">
                      <i className="far fa-calendar-plus"></i> Created: {createdDate}
                    </p>
                  )}
                  {isUpdated && updatedDate && (
                    <p className="date-updated">
                      <i className="far fa-calendar-check"></i> Updated: {updatedDate}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="action-buttons">
                <div className="primary-actions">
                  <button
                    onClick={handleShare}
                    className={`dream-button ${isCurrentlyShared ? 'unshare-button' : 'share-button'}`}
                    aria-label={isCurrentlyShared ? "Stop sharing this dream" : "Share this dream"}
                    disabled={isSharing || isUnsharing}
                  >
                    <i className={`fas ${isCurrentlyShared ? 'fa-unlink' : 'fa-share-alt'}`}></i>
                    <span>
                      {isSharing ? 'Sharing...' : 
                       isUnsharing ? 'Unsharing...' : 
                       isCurrentlyShared ? 'Unshare' : 'Share'}
                    </span>
                  </button>

                  {hasVisualizations && (
                    <button
                      onClick={handleMintNFT}
                      className={`dream-button ${isMinted ? 'burn-button' : 'mint-button'}`}
                      aria-label={isMinted ? "Burn this NFT" : "Mint as NFT"}
                      disabled={isMinting || isBurning}
                    >
                      <i className={`fas ${isMinted ? 'fa-fire' : 'fa-gem'}`}></i>
                      <span>
                        {isMinting ? 'Minting...' : 
                         isBurning ? 'Burning...' : 
                         isMinted ? 'Burn NFT' : 'Mint NFT'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="management-actions">
                  <button
                    onClick={handleEdit}
                    className={`dream-button edit-button ${isMinted ? 'disabled' : ''}`}
                    aria-label="Edit this dream"
                    disabled={isMinted}
                    title={isMinted ? "Dreams with minted NFTs cannot be edited" : "Edit this dream"}
                  >
                    <i className="fas fa-edit"></i>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={isMinted ? handleMintedDeleteAttempt : () => setDreamToDelete(entry)}
                    className={`dream-button delete-button ${isMinted ? 'disabled' : ''}`}
                    aria-label="Delete this dream"
                    disabled={isMinted}
                    title={isMinted ? "Dreams with minted NFTs cannot be deleted" : "Delete this dream"}
                  >
                    <i className="fas fa-trash"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {(shareLink || shareError) && (
        <div className={`notification-panel ${shareLink ? 'success-panel' : 'error-panel'} share-notification`}>
          <button className="dismiss-notification" onClick={() => dismissNotification('share')} aria-label="Dismiss notification">
            <i className="fas fa-times"></i>
          </button>
          
          {shareLink && (
            <>
              <div className="notification-header">
                <i className="fas fa-link"></i>
                <span>Share link created!</span>
                {clipboardStatus && <span className="clipboard-status">{clipboardStatus}</span>}
              </div>
              <div className="share-link">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  onClick={(e) => e.target.select()}
                  aria-label="Shareable link"
                />
                <button 
                  onClick={handleCopyClick}
                  className="copy-button"
                  aria-label="Copy link to clipboard"
                >
                  <i className="fas fa-copy"></i> Copy
                </button>
              </div>
            </>
          )}
          
          {shareError && (
            <div className="notification-header">
              <i className="fas fa-exclamation-circle"></i>
              <span>{shareError}</span>
            </div>
          )}
        </div>
      )}
      
      {(mintSuccess || mintError) && (
        <div className={`notification-panel ${mintSuccess ? 'success-panel' : 'error-panel'} mint-notification`}>
          <button className="dismiss-notification" onClick={() => dismissNotification('mint')} aria-label="Dismiss notification">
            <i className="fas fa-times"></i>
          </button>
          
          {mintSuccess && (
            <div className="notification-header">
              <i className="fas fa-check-circle"></i>
              <span>NFT minted successfully!</span>
              <Link to="/nft-gallery" className="gallery-link" onClick={(e) => e.stopPropagation()}>
                View in Gallery <i className="fas fa-external-link-alt"></i>
              </Link>
            </div>
          )}
          
          {mintError && (
            <div className="notification-header">
              <i className="fas fa-exclamation-circle"></i>
              <span>{mintError}</span>
            </div>
          )}
        </div>
      )}
      
      {imageZoomed && (
        <div className="image-modal-backdrop" onClick={toggleImageZoom} role="dialog" aria-label="Zoomed image">
          <div className="image-modal">
            <button className="close-modal" onClick={toggleImageZoom} aria-label="Close zoomed image">
              <i className="fas fa-times"></i>
            </button>
            <img 
              src={`data:image/png;base64,${entry.imageData}`} 
              alt="Dream visualization"
              className="modal-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </article>
  );
};

export default DreamEntryItem;