import React, { useState } from 'react';
import '../styles/NFTCard.scss';

const NFTCard = ({ nft }) => {
  const [showDetails, setShowDetails] = useState(false);

  const extractTokenId = () => {
    if (!nft || !nft.metadata || !nft.metadata.name) {
      return nft?.tokenId || '?';
    }
    
    const match = nft.metadata.name.match(/#(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    return nft.tokenId || '?';
  };

  const tokenId = extractTokenId();

  const formatDate = (timestamp) => {
    let timeValue;
    
    if (typeof timestamp === 'bigint') {
      timeValue = Number(timestamp) / 1000000;
    } else if (typeof timestamp === 'object' && 'int' in timestamp) {
      timeValue = Number(timestamp.int) / 1000000;
    } else {
      timeValue = Number(timestamp) / 1000000;
    }
    
    try {
      const date = new Date(timeValue);
      
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
      console.error("Error formatting date:", e);
      return 'Date error';
    }
  };

  const extractAttributeValue = (attribute) => {
    if (!attribute) return "";
    
    if (typeof attribute === "string" || typeof attribute === "number") {
      return attribute;
    }
    
    if (typeof attribute === "object") {
      if ('int' in attribute) return attribute.int.toString();
      if ('text' in attribute) return attribute.text;
      if ('nat' in attribute) return attribute.nat.toString();
      if ('bool' in attribute) return attribute.bool.toString();
    }
    
    return "";
  };

  const getDreamText = () => {
    if (!nft?.metadata?.attributes || 
        !Array.isArray(nft.metadata.attributes) || 
        nft.metadata.attributes.length === 0) {
      return "";
    }
    
    const dreamAttribute = nft.metadata.attributes.find(
      attr => Array.isArray(attr) && attr[0] === "dreamText"
    ) || nft.metadata.attributes[0];
    
    if (Array.isArray(dreamAttribute) && dreamAttribute.length > 1) {
      return extractAttributeValue(dreamAttribute[1]);
    }
    
    return "";
  };

  const dreamText = getDreamText();
  const mintedDate = nft?.minted ? formatDate(nft.minted) : "Date unavailable";
  
  const truncateDreamText = (text) => {
    if (!text) return '';
    return text.length > 100 ? `${text.substring(0, 100)}...` : text;
  };

  const renderNFTImage = () => {
    const imageData = nft.metadata.image;
    
    if (imageData === "data:image/png;base64,...") {
      return (
        <div className="placeholder-image">
          <i className="fas fa-image"></i>
          <p>Image preview unavailable</p>
          <p className="small-text">Large image stored securely</p>
        </div>
      );
    }
  
    return (
      <img 
        src={`data:image/png;base64,${imageData}`} 
        alt={nft.metadata.name}
        className="nft-image"
      />
    );
  };

  return (
    <div className="nft-card">
      <div className="nft-image-container">
        {renderNFTImage()}
        <div className="nft-overlay">
          <span className="nft-id">#{tokenId}</span>
        </div>
      </div>
      
      <div className="nft-info">
        <h3 className="nft-title">{nft.metadata.name}</h3>
        <p className="nft-mint-date">Minted: {mintedDate}</p>
        
        <div className="nft-actions">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="toggle-details-button"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
        </div>
        
        {showDetails && (
          <div className="nft-details">
            <div className="detail-item">
              <h4>Description:</h4>
              <p>{nft.metadata.description}</p>
            </div>
            
            <div className="detail-item">
              <h4>Dream Text:</h4>
              <p>{truncateDreamText(dreamText)}</p>
            </div>
            
            <div className="detail-item">
              <h4>Token ID:</h4>
              <p>{tokenId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;