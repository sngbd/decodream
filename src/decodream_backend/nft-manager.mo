import DreamDatabase "./dream-database";
import Types "./types";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";

module {
  public class NFTManager(db: DreamDatabase.DreamDatabase, initialData: {
    tokens : [(Nat, Types.DreamNFT)];
    ownedTokens : [(Text, [Nat])];
    mintedDreams : [(Text, Int)];
    nextTokenId : Nat;
  }) {
    private func natHash(n: Nat) : Hash.Hash {
      Text.hash(Nat.toText(n))
    };
    
    private var tokens = HashMap.fromIter<Nat, Types.DreamNFT>(
      initialData.tokens.vals(), 10, Nat.equal, natHash
    );
    private var ownedTokens = HashMap.fromIter<Principal, Buffer.Buffer<Nat>>(
        Iter.map<(Text, [Nat]), (Principal, Buffer.Buffer<Nat>)>(
            initialData.ownedTokens.vals(),
            func(entry) {
                let (user, tokenIds) = entry;
                let buffer = Buffer.Buffer<Nat>(tokenIds.size());
                for (id in tokenIds.vals()) {
                    buffer.add(id);
                };
                (Principal.fromText(user), buffer)
            }
        ),
        10, Principal.equal, Principal.hash
    );

    private var mintedDreams = HashMap.fromIter<Text, Int>(
      initialData.mintedDreams.vals(), 10, Text.equal, Text.hash
    );
    private var nextTokenId = initialData.nextTokenId;
    
    private let collection : Types.Collection = {
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
    
    public func isDreamMinted(userId : Text, timestamp : Int) : async Bool {
      let key = userId # ":" # Int.toText(timestamp);
      switch (mintedDreams.get(key)) {
        case (null) { false };
        case (?_) { true };
      };
    };
    
    public func mintDreamNFT(user: Text, timestamp : Int, description : Text) : async ?Nat {
      let isAlreadyMinted = await isDreamMinted(user, timestamp);
      if (isAlreadyMinted) {
        return null;
      };

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
            name = "Dream Token #" # Nat.toText(nextTokenId);
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
          
          let key = user # ":" # Int.toText(timestamp);
          mintedDreams.put(key, timestamp);
          
          return ?tokenId;
        };
      };
    };
    
    public func burnDreamNFT(userId : Text, timestamp : Int) : async Bool {
      if (not (await isDreamMinted(userId, timestamp))) {
        return false;
      };
      
      var tokenToBurn : ?Nat = null;
      for ((id, token) in tokens.entries()) {
        if (Principal.toText(token.owner) == userId and 
            token.dreamTimestamp == timestamp) {
          tokenToBurn := ?id;
        };
      };
      
      switch (tokenToBurn) {
        case (null) { return false };
        case (?id) {
          switch (tokens.get(id)) {
            case (null) { return false };
            case (?token) {
              tokens.delete(id);
              
              switch (ownedTokens.get(token.owner)) {
                case (null) {};
                case (?buffer) {
                  let newBuffer = Buffer.Buffer<Nat>(buffer.size());
                  for (tokenId in buffer.vals()) {
                    if (tokenId != id) {
                      newBuffer.add(tokenId);
                    };
                  };
                  ownedTokens.put(token.owner, newBuffer);
                };
              };
              
              let key = userId # ":" # Int.toText(timestamp);
              mintedDreams.delete(key);

              return true;
            };
          };
        };
      };
    };
    
    public func getMyDreamNFTs(user : Text) : [Types.DreamNFT] {
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
    
    public func getDreamNFT(tokenId : Nat) : ?Types.DreamNFT {
      tokens.get(tokenId)
    };
    
    public func icrc7_collection() : Types.Collection {
      return collection;
    };
    
    public func icrc7_total_supply() : Nat {
      return tokens.size();
    };
    
    public func icrc7_owner_of(token_id : Nat) : ?Types.Account {
      switch (tokens.get(token_id)) {
        case (null) { null };
        case (?token) {
          ?{ owner = token.owner; subaccount = null };
        };
      };
    };
    
    public func icrc7_tokens_of(account : Types.Account) : [Nat] {
      switch (ownedTokens.get(account.owner)) {
        case (null) { [] };
        case (?buffer) { Buffer.toArray(buffer) };
      };
    };
    
    public func icrc7_is_authorized(token_id : Nat, account : Types.Account) : Bool {
      switch (tokens.get(token_id)) {
        case (null) { false };
        case (?token) {
          Principal.equal(token.owner, account.owner)
        };
      };
    };
    
    public func icrc7_metadata(token_id : Nat) : ?Types.Metadata {
      switch (tokens.get(token_id)) {
        case (null) { null };
        case (?token) { ?token.metadata };
      };
    };
    
    public func icrc7_transfer() : Types.TransferResult {
      return #Err(#Unauthorized);
    };
    
    private var stableTokens : [Types.DreamNFT] = [];
    private var stableMintedDreams : [(Text, Int)] = [];
    
    public func preupgrade() {
      let tokenArr = Buffer.Buffer<Types.DreamNFT>(tokens.size());
      for ((_, token) in tokens.entries()) {
        tokenArr.add(token);
      };
      stableTokens := Buffer.toArray(tokenArr);
      
      let mintedDreamEntries = Iter.toArray(mintedDreams.entries());
      stableMintedDreams := Array.map<(Text, Int), (Text, Int)>(
        mintedDreamEntries,
        func ((key, timestamp)) : (Text, Int) {
          let parts = Text.split(key, #char(':'));
          let userId = switch(parts.next()) {
            case (?id) { id };
            case (null) { "" };
          };
          (userId, timestamp)
        }
      );
    };
    
    public func postupgrade() {
      tokens := HashMap.HashMap<Nat, Types.DreamNFT>(stableTokens.size(), Nat.equal, natHash);
      ownedTokens := HashMap.HashMap<Principal, Buffer.Buffer<Nat>>(10, Principal.equal, Principal.hash);
      
      for (token in stableTokens.vals()) {
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
      
      mintedDreams := HashMap.HashMap<Text, Int>(10, Text.equal, Text.hash);
      for ((userId, timestamp) in stableMintedDreams.vals()) {
        let key = userId # ":" # Int.toText(timestamp);
        mintedDreams.put(key, timestamp);
      };
    };

    public func getUserDreamNFTs(user : Text) : [Types.DreamNFT] {
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

    public func getAllTokens() : [(Nat, Types.DreamNFT)] {
      Iter.toArray(tokens.entries())
    };
    
    public func getAllOwnedTokens() : [(Text, [Nat])] {
        let entries = Iter.toArray(ownedTokens.entries());
        Array.map<(Principal, Buffer.Buffer<Nat>), (Text, [Nat])>(
            entries,
            func(entry) {
                let (principal, buffer) = entry;
                (Principal.toText(principal), Buffer.toArray(buffer))
            }
        )
    };
    
    public func getAllMintedDreams() : [(Text, Int)] {
      let entries = Iter.toArray(mintedDreams.entries());
      
      return Array.map<(Text, Int), (Text, Int)>(
        entries,
        func((key, timestamp)) {
          let parts = Text.split(key, #char(':'));
          let userId = switch(parts.next()) {
            case (?id) { id };
            case (null) { "" };
          };
          (userId, timestamp)
        }
      );
    };
    
    public func getNextTokenId() : Nat {
      nextTokenId
    };
  };
}