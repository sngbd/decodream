import DreamDatabase "./dream-database";
import ShareManager "./share-manager";
import NFTManager "./nft-manager";
import GalleryManager "./gallery-manager";
import Types "./types";

actor Decodream {
  stable var dreamEntries : [(Text, [Types.DreamEntry])] = [];
  stable var dreamShares : [(Text, [(Text, Types.ShareableDreamEntry)])] = [];
  stable var nftData : {
    tokens : [(Nat, Types.DreamNFT)];
    ownedTokens : [(Text, [Nat])];
    mintedDreams : [(Text, Int)];
    nextTokenId : Nat;
  } = {
    tokens = [];
    ownedTokens = [];
    mintedDreams = [];
    nextTokenId = 0;
  };
  stable var galleriesShared : [(Text, Bool)] = [];

  private var db = DreamDatabase.DreamDatabase(dreamEntries);
  private var shareManager = ShareManager.ShareManager(db, dreamShares);
  private var nftManager = NFTManager.NFTManager(db, nftData);
  private var galleryManager = GalleryManager.GalleryManager(galleriesShared, nftManager);
  
  public func addDreamEntry(entry : Types.DreamEntry) : async () {
    db.addEntry(entry);
  };
  
  public query func getDreamEntriesByUser(userPrincipal : Text) : async [Types.DreamEntry] {
    db.getEntriesByUser(userPrincipal)
  };
  
  public func updateDreamEntry(
    user : Text, 
    timestamp : Int, 
    dreamText : Text, 
    analysis : Text, 
    updateTimestamp : Int,
    imageData : Text
  ) : async Bool {
    let isMinted = await nftManager.isDreamMinted(user, timestamp);
    if (isMinted) {
      return false;
    };
    return db.updateEntry(user, timestamp, dreamText, analysis, updateTimestamp, imageData);
  };
  
  public func deleteDreamEntry(user : Text, timestamp : Int) : async Bool {
    let isMinted = await nftManager.isDreamMinted(user, timestamp);
    if (isMinted) {
      return false;
    };

    let _ = shareManager.revokeAllSharesForDream(user, timestamp);
    return db.deleteEntry(user, timestamp);
  };
  
  public query func isDreamShared(userId : Text, timestamp : Int) : async Bool {
    shareManager.isDreamShared(userId, timestamp)
  };
  
  public shared func createShareableLink(userId : Text, timestamp : Int) : async [Text] {
    shareManager.createShareableLink(userId, timestamp)
  };
  
  public shared func revokeDreamShare(userId : Text, timestamp : Int) : async Bool {
    shareManager.revokeDreamShare(userId, timestamp)
  };
  
  public query func getSharedDream(shareId : Text) : async ?Types.ShareableDreamEntry {
    shareManager.getSharedDream(shareId)
  };
  
  public query func getShareLinksForUser(user : Text) : async [(Text, Types.ShareableDreamEntry)] {
    shareManager.getShareLinksForUser(user)
  };
  
  public func deleteShareLink(user : Text, shareId : Text) : async Bool {
    shareManager.deleteShareLink(user, shareId)
  };
  
  public shared func isDreamMinted(userId : Text, timestamp : Int) : async Bool {
    await nftManager.isDreamMinted(userId, timestamp)
  };
  
  public shared func mintDreamNFT(user: Text, timestamp : Int, description : Text) : async ?Int {
    await nftManager.mintDreamNFT(user, timestamp, description)
  };
  
  public shared func burnDreamNFT(userId : Text, timestamp : Int) : async Bool {
    await nftManager.burnDreamNFT(userId, timestamp)
  };
  
  public query func getMyDreamNFTs(user : Text) : async [Types.DreamNFT] {
    nftManager.getMyDreamNFTs(user)
  };
  
  public query func getDreamNFT(tokenId : Nat) : async ?Types.DreamNFT {
    nftManager.getDreamNFT(tokenId)
  };
  
  public query func icrc7_collection() : async Types.Collection {
    nftManager.icrc7_collection()
  };
  
  public query func icrc7_total_supply() : async Nat {
    nftManager.icrc7_total_supply()
  };
  
  public query func icrc7_owner_of(token_id : Nat) : async ?Types.Account {
    nftManager.icrc7_owner_of(token_id)
  };
  
  public query func icrc7_tokens_of(account : Types.Account) : async [Nat] {
    nftManager.icrc7_tokens_of(account)
  };
  
  public query func icrc7_is_authorized(token_id : Nat, account : Types.Account) : async Bool {
    nftManager.icrc7_is_authorized(token_id, account)
  };
  
  public query func icrc7_metadata(token_id : Nat) : async ?Types.Metadata {
    nftManager.icrc7_metadata(token_id)
  };
  
  public shared func icrc7_transfer() : async Types.TransferResult {
    nftManager.icrc7_transfer()
  };

  public shared func toggleGallerySharing(principal : Text, isPublic : Bool) : async Bool {
   galleryManager.toggleGallerySharing(principal, isPublic)
  };

  public shared func isGalleryPublic(principal : Text) : async Bool {
    galleryManager.isGalleryPublic(principal)
  };

  public shared func getPublicGallery(principal : Text) : async [Types.DreamNFT] {
    galleryManager.getPublicGallery(principal)
  };
  
  system func preupgrade() {
    dreamEntries := db.getAllEntries();
    dreamShares := shareManager.getAllShares();
    nftData := {
      tokens = nftManager.getAllTokens();
      ownedTokens = nftManager.getAllOwnedTokens();
      mintedDreams = nftManager.getAllMintedDreams();
      nextTokenId = nftManager.getNextTokenId();
    };
    galleriesShared := galleryManager.getAllGalleries();
  };
  
  system func postupgrade() {
    db := DreamDatabase.DreamDatabase(dreamEntries);
    shareManager := ShareManager.ShareManager(db, dreamShares);
    nftManager := NFTManager.NFTManager(db, nftData);
    galleryManager := GalleryManager.GalleryManager(galleriesShared, nftManager);
    
    db.postupgrade();
    shareManager.postupgrade();
    nftManager.postupgrade();
    galleryManager.postupgrade();
  };
}