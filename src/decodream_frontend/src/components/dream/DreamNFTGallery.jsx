import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { decodream_backend as ded } from '../../../../declarations/decodream_backend';
import Loading from '../common/Loading';
import NFTCard from './NFTCard';
import '../styles/DreamNFTGallery.scss';

const DreamNFTGallery = () => {
  const { identity, getPrincipal } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!identity) return;

    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const myNFTs = await ded.getMyDreamNFTs(getPrincipal());
        setNfts(myNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to load your Dream NFTs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [identity]);

  if (loading) {
    return (
      <div className="dream-nft-gallery loading">
        <Loading size="lg" />
        <p>Loading your Dream NFT collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dream-nft-gallery error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="dream-nft-gallery empty">
        <h2>Your Dream NFT Collection</h2>
        <div className="empty-state">
          <p>You haven't minted any Dream NFTs yet.</p>
          <p>Visit your Dreams page to mint NFTs from your dream visualizations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dream-nft-gallery">
      <h2>Your Dream NFT Collection</h2>
      <p className="collection-info">
        These are soulbound NFTs created from your dream visualizations. 
        Each is a unique digital collectible that cannot be transferred.
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