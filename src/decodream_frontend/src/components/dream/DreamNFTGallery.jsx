import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { decodream_backend as ded } from '../../../../declarations/decodream_backend';
import Loading from '../common/Loading';
import NFTCard from './NFTCard';
import '../styles/DreamNFTGallery.scss';
import { toast } from 'react-toastify';

const DreamNFTGallery = () => {
  const { identity, getPrincipal } = useAuth();
  const { principalId } = useParams();
  const navigate = useNavigate();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingLoading, setSharingLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const isOwnGallery = !principalId || principalId === getPrincipal();
  const currentPrincipal = isOwnGallery ? getPrincipal() : principalId;

  useEffect(() => {
    if (!identity && !principalId) return;
    
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        
        if (!isOwnGallery) {
          const galleryIsPublic = await ded.isGalleryPublic(principalId);
          if (!galleryIsPublic) {
            setError('This gallery is private or does not exist.');
            setLoading(false);
            return;
          }
          
          try {
            const profileInfo = await ded.getProfileInfo(principalId);
            if (profileInfo && profileInfo.username) {
              setOwnerName(profileInfo.username);
            }
          } catch (e) {
          }
        } else {
          const galleryIsPublic = await ded.isGalleryPublic(getPrincipal());
          setIsPublic(galleryIsPublic);
        }
        
        const nftData = isOwnGallery 
          ? await ded.getMyDreamNFTs(getPrincipal())
          : await ded.getPublicGallery(currentPrincipal);
        
        setNfts(nftData || []);
      } catch (err) {
        console.error('Error fetching NFT gallery:', err);
        setError('Failed to load the NFT gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryData();
  }, [identity, principalId, isOwnGallery]);

  const togglePublicStatus = async () => {
    if (!identity) return;
    
    try {
      setSharingLoading(true);
      const newStatus = !isPublic;
      
      const success = await ded.toggleGallerySharing(getPrincipal(), newStatus);
      
      if (success) {
        setIsPublic(newStatus);
        toast.success(`Gallery is now ${newStatus ? 'public' : 'private'}`);
      } else {
        toast.error('Failed to update gallery sharing settings');
      }
    } catch (err) {
      console.error('Error toggling gallery status:', err);
      toast.error('Failed to update sharing status: ' + err.message);
    } finally {
      setSharingLoading(false);
    }
  };

  const copyShareLink = () => {
    if (!isPublic || !getPrincipal()) return;
    
    const shareLink = `${window.location.origin}/nft-gallery/${getPrincipal()}`;
    
    try {
      navigator.clipboard.writeText(shareLink)
        .then(() => {
          setCopySuccess('Copied!');
          setTimeout(() => setCopySuccess(''), 2000);
        })
        .catch(() => {
          fallbackCopyTextToClipboard(shareLink);
        });
    } catch (err) {
      fallbackCopyTextToClipboard(shareLink);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    let successful = false;
    try {
      successful = document.execCommand('copy');
      if (successful) {
        setCopySuccess('Copied!');
      } else {
        setCopySuccess('Copy failed');
      }
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      setCopySuccess('Copy failed');
    }
    
    document.body.removeChild(textArea);
    
    setTimeout(() => setCopySuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="dream-nft-gallery loading">
        <Loading size="lg" />
        <p>Loading {isOwnGallery ? 'your' : 'this'} Dream NFT collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dream-nft-gallery error">
        <h2>Gallery Not Available</h2>
        <p>{error}</p>
        {!isOwnGallery && (
          <button className="dream-button" onClick={() => navigate('/nft-gallery')}>
            View My Gallery
          </button>
        )}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="dream-nft-gallery empty">
        <h2>{isOwnGallery ? 'Your Dream NFT Collection' : "This Gallery is Empty"}</h2>
        <div className="empty-state">
          {isOwnGallery ? (
            <>
              <p>You haven't minted any Dream NFTs yet.</p>
              <p>Visit your Dreams page to mint NFTs from your dream visualizations!</p>
              <button className="dream-button" onClick={() => navigate('/dreams')}>
                Go to Dreams
              </button>
            </>
          ) : (
            <>
              <p>{ownerName || "This user"} hasn't minted any Dream NFTs yet.</p>
              <button className="dream-button" onClick={() => navigate('/nft-gallery')}>
                View My Gallery
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dream-nft-gallery">
      <div className="gallery-header">
        <h2>{isOwnGallery ? 'Your Dream NFT Collection' : 
            ownerName ? `${ownerName}'s Dream NFTs` : 'Shared NFT Gallery'}</h2>
        
        {isOwnGallery && (
          <div className="gallery-controls">
            <div className="sharing-toggle">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={isPublic} 
                  onChange={togglePublicStatus}
                  disabled={sharingLoading}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">
                {sharingLoading ? 'Updating...' : isPublic ? 'Public Gallery' : 'Private Gallery'}
              </span>
            </div>
            
            {isPublic && (
              <div className="share-controls">
                <button 
                  className="dream-button share-button" 
                  onClick={copyShareLink}
                  title="Copy share link"
                >
                  <i className="fas fa-share-alt"></i>
                  {copySuccess || 'Share Gallery'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="collection-info">
        {isOwnGallery ? (
          'These are soulbound NFTs created from your dream visualizations. Each is a unique digital collectible that cannot be transferred.'
        ) : (
          'This is a shared collection of dream visualization NFTs. Each NFT represents a unique dream experience.'
        )}
      </p>
      
      <div className="nft-grid">
        {nfts.map(nft => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
      </div>
    </div>
  );
};

export default DreamNFTGallery;