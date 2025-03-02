import React, { useState } from 'react';
import '../styles/NFTCard.scss';

const NFTCard = ({ nft }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(Number(timestamp));
    
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const findAttribute = (name) => {
    const attribute = nft.metadata.attributes.find(attr => attr[0] === name);
    if (attribute) {
      if ('int' in attribute[1]) return attribute[1].int;
      if ('text' in attribute[1]) return attribute[1].text;
      if ('nat' in attribute[1]) return attribute[1].nat;
    }
    return null;
  };

  const dreamText = findAttribute('dreamText');
  const mintedDate = formatDate(nft.minted);
  
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
          <span className="nft-id">#{nft.tokenId}</span>
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
              <p>{nft.tokenId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTCard;