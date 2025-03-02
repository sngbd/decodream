import DreamDatabase "./dream-database";
import Text "mo:base/Text";
import Types "./types";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat32 "mo:base/Nat32";
import Int "mo:base/Int";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";

actor Decodream {
  private func natHash(n: Nat) : Hash.Hash {
    Text.hash(Nat.toText(n))
  };

  stable var dreamEntries : [Types.DreamEntry] = [];
  stable var shareLinksEntries : [(Text, Types.ShareableDreamEntry)] = [];

  stable var nftEntries : [Types.DreamNFT] = [];
  stable var nextTokenId : Nat = 1;
  
  let collection : Types.Collection = {
    name = "Dream Visions";
    symbol = "DREAM";
    royalties = 0;
    royaltyRecipient = {
      owner = Principal.fromText("aaaaa-aa");
      subaccount = null;
    };
    description = "AI-generated visualizations of dreams from the Decodream platform";
    image = "";
    totalSupply = 0;
  };
  
  private var db = DreamDatabase.DreamDatabase();
  private var shareLinks = HashMap.HashMap<Text, Types.ShareableDreamEntry>(10, Text.equal, Text.hash);
  private var tokens = HashMap.HashMap<Nat, Types.DreamNFT>(10, Nat.equal, natHash);
  private var ownedTokens = HashMap.HashMap<Principal, Buffer.Buffer<Nat>>(10, Principal.equal, Principal.hash);
  
  system func preupgrade() {
    dreamEntries := db.getAllEntries();
    shareLinksEntries := Iter.toArray(shareLinks.entries());

    let tokenArr = Buffer.Buffer<Types.DreamNFT>(tokens.size());
    for ((_, token) in tokens.entries()) {
      tokenArr.add(token);
    };
    nftEntries := Buffer.toArray(tokenArr);
  };
  
  system func postupgrade() {
    db.populateFromEntries(dreamEntries);
    shareLinks := HashMap.fromIter<Text, Types.ShareableDreamEntry>(
      shareLinksEntries.vals(), 10, Text.equal, Text.hash
    );

    tokens := HashMap.HashMap<Nat, Types.DreamNFT>(nftEntries.size(), Nat.equal, natHash);
    ownedTokens := HashMap.HashMap<Principal, Buffer.Buffer<Nat>>(10, Principal.equal, Principal.hash);
    
    for (token in nftEntries.vals()) {
      tokens.put(token.tokenId, token);
      
      switch (ownedTokens.get(token.owner)) {
        case (null) {
          let newBuffer = Buffer.Buffer<Nat>(1);
          newBuffer.add(token.tokenId);
          ownedTokens.put(token.owner, newBuffer);
        };
        case (?buffer) {
          buffer.add(token.tokenId);
        };
      };
    };
  };
  
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
    db.updateEntry(user, timestamp, dreamText, analysis, updateTimestamp, imageData)
  };
  
  public func deleteDreamEntry(user : Text, timestamp : Int) : async Bool {
    for ((shareId, entry) in shareLinks.entries()) {
      if (entry.originalUser == user and entry.originalTimestamp == timestamp) {
        shareLinks.delete(shareId);
      };
    };
    
    db.deleteEntry(user, timestamp)
  };
  
  public func createShareableLink(user : Text, timestamp : Int) : async ?Text {
    let entry = db.getEntryByTimestamp(user, timestamp);
    
    switch (entry) {
      case (null) { 
        return null; 
      };
      case (?dreamEntry) {
        let currentTime = Time.now();
        let hashInput = user # Int.toText(timestamp) # Int.toText(currentTime);
        let shareId = generateShareId(hashInput);
        
        let shareableEntry : Types.ShareableDreamEntry = {
          dreamText = dreamEntry.dreamText;
          analysis = dreamEntry.analysis;
          timestamp = dreamEntry.timestamp;
          lastUpdated = dreamEntry.lastUpdated;
          imageData = dreamEntry.imageData;
          originalUser = user;
          originalTimestamp = timestamp;
          created = currentTime;
        };
        
        shareLinks.put(shareId, shareableEntry);
        return ?shareId;
      };
    };
  };
  
  private func generateShareId(input : Text) : Text {
    let hashValue = Text.hash(input);
    let alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let chars = Iter.toArray(Text.toIter(alphanumeric));
    var id = "";

    var remainingHash = Nat32.toNat(hashValue);
    for (_ in Iter.range(0, 7)) {
      let index = remainingHash % 62;
      let char = chars[index];
      id := id # Text.fromChar(char);
      remainingHash := remainingHash / 62;
    };

    return id;
  };
  
  public query func getSharedDream(shareId : Text) : async ?Types.ShareableDreamEntry {
    shareLinks.get(shareId)
  };
  
  public query func getShareLinksForUser(user : Text) : async [(Text, Types.ShareableDreamEntry)] {
    let userLinks = Iter.filter<(Text, Types.ShareableDreamEntry)>(
      shareLinks.entries(), 
      func((_, entry)) : Bool { entry.originalUser == user }
    );
    
    return Iter.toArray(userLinks);
  };
  
  public func deleteShareLink(user : Text, shareId : Text) : async Bool {
    switch (shareLinks.get(shareId)) {
      case (null) { 
        return false;
      };
      case (?entry) {
        if (entry.originalUser != user) {
          return false;
        };
        
        shareLinks.delete(shareId);
        return true;
      };
    };
  };
 
  public query func icrc7_collection() : async Types.Collection {
    return collection;
  };
  
  public query func icrc7_total_supply() : async Nat {
    return tokens.size();
  };
  
  public query func icrc7_owner_of(token_id : Nat) : async ?Types.Account {
    switch (tokens.get(token_id)) {
      case (null) { null };
      case (?token) {
        ?{ owner = token.owner; subaccount = null };
      };
    };
  };
  
  public query func icrc7_tokens_of(account : Types.Account) : async [Nat] {
    switch (ownedTokens.get(account.owner)) {
      case (null) { [] };
      case (?buffer) { Buffer.toArray(buffer) };
    };
  };
  
  public query func icrc7_is_authorized(token_id : Nat, account : Types.Account) : async Bool {
    switch (tokens.get(token_id)) {
      case (null) { false };
      case (?token) {
        Principal.equal(token.owner, account.owner)
      };
    };
  };
  
  public query func icrc7_metadata(token_id : Nat) : async ?Types.Metadata {
    switch (tokens.get(token_id)) {
      case (null) { null };
      case (?token) { ?token.metadata };
    };
  };
  
  public shared func icrc7_transfer() : async Types.TransferResult {
    return #Err(#Unauthorized);
  };
  
  public shared func mintDreamNFT(user: Text, timestamp : Int, name : Text, description : Text) : async ?Nat {
    let entry = db.getEntryByTimestamp(user, timestamp);
    
    switch (entry) {
      case (null) { 
        return null;
      };
      case (?dreamEntry) {
        if (dreamEntry.user != user) {
          return null;
        };
        
        if (Text.size(dreamEntry.imageData) == 0) {
          return null;
        };

        let imageData = if (Text.size(dreamEntry.imageData) > 500000) {
          "data:image/png;base64,..."
        } else {
          dreamEntry.imageData
        };
        
        let metadata : Types.Metadata = {
          name = name;
          description = description;
          image = imageData; 
          attributes = [
            ("dreamTimestamp", #int(timestamp)),
            ("dreamText", #text(
              if (Text.size(dreamEntry.dreamText) > 1000) {
                let chars = Text.toIter(dreamEntry.dreamText);
                var count = 0;
                var truncated = "";
                
                label l loop {
                  switch (chars.next()) {
                    case (null) { break l };
                    case (?c) {
                      if (count >= 1000) { break l };
                      truncated := truncated # Text.fromChar(c);
                      count += 1;
                    };
                  };
                };
                
                truncated # "..."
              } else {
                dreamEntry.dreamText
              }
            )),
            ("mintedAt", #int(Time.now())),
          ];
        };
        
        let tokenId = nextTokenId;
        nextTokenId += 1;
        
        let newNFT : Types.DreamNFT = {
          tokenId = tokenId;
          owner = Principal.fromText(user);
          dreamTimestamp = timestamp;
          metadata = metadata;
          minted = Time.now();
        };
        
        tokens.put(tokenId, newNFT);
        
        switch (ownedTokens.get(Principal.fromText(user))) {
          case (null) {
            let newBuffer = Buffer.Buffer<Nat>(1);
            newBuffer.add(tokenId);
            ownedTokens.put(Principal.fromText(user), newBuffer);
          };
          case (?buffer) {
            buffer.add(tokenId);
          };
        };
        
        return ?tokenId;
      };
    };
  };
  
  public query func getMyDreamNFTs(user : Text) : async [Types.DreamNFT] {
    switch (ownedTokens.get(Principal.fromText(user))) {
      case (null) { return [] };
      case (?buffer) {
        let result = Buffer.Buffer<Types.DreamNFT>(buffer.size());
        for (tokenId in buffer.vals()) {
          switch (tokens.get(tokenId)) {
            case (null) {};
            case (?token) { result.add(token) };
          };
        };
        return Buffer.toArray(result);
      };
    };
  };
  
  public query func getDreamNFT(tokenId : Nat) : async ?Types.DreamNFT {
    tokens.get(tokenId)
  };
}