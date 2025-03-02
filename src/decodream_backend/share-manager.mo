import DreamDatabase "./dream-database";
import Types "./types";
import Text "mo:base/Text";
import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Nat32 "mo:base/Nat32";

module {
    public class ShareManager(db: DreamDatabase.DreamDatabase, initialShares: [(Text, [(Text, Types.ShareableDreamEntry)])]) {

    private var userShares = HashMap.fromIter<Text, HashMap.HashMap<Text, Types.ShareableDreamEntry>>(
        Iter.map<(Text, [(Text, Types.ShareableDreamEntry)]), (Text, HashMap.HashMap<Text, Types.ShareableDreamEntry>)>(
            initialShares.vals(), 
            func(entry) {
                let (user, shares) = entry;
                let sharesMap = HashMap.fromIter<Text, Types.ShareableDreamEntry>(
                    shares.vals(), 10, Text.equal, Text.hash
                );
                (user, sharesMap)
            }
        ), 
        10, Text.equal, Text.hash
    );

    private var shareLinks = HashMap.HashMap<Text, Types.ShareableDreamEntry>(10, Text.equal, Text.hash);
    private var shareableLinks : [(Text, Text, Int)] = [];
    private var sharedDreams : [(Text, Int)] = [];
    
    public func isDreamShared(userId : Text, timestamp : Int) : Bool {
      for ((uid, ts) in sharedDreams.vals()) {
        if (uid == userId and ts == timestamp) {
          return true;
        };
      };
      return false;
    };
    
    public func createShareableLink(userId : Text, timestamp : Int) : [Text] {
      let isAlreadyShared = isDreamShared(userId, timestamp);
      
      if (isAlreadyShared) {
        for ((shareId, uid, ts) in shareableLinks.vals()) {
          if (uid == userId and ts == timestamp) {
            return [shareId];
          };
        };
      };
      
      let shareId = generateShareId(Int.toText(timestamp));
      shareableLinks := Array.append(shareableLinks, [(shareId, userId, timestamp)]);
      
      sharedDreams := Array.append(sharedDreams, [(userId, timestamp)]);
      
      let dreamEntry = db.getEntryByTimestamp(userId, timestamp);
      switch (dreamEntry) {
        case (null) { return []; };
        case (?entry) {
          let shareable : Types.ShareableDreamEntry = {
            originalUser = userId;
            originalTimestamp = timestamp;
            dreamText = entry.dreamText;
            analysis = entry.analysis;
            created = entry.created;
            updated = entry.updated;
            imageData = entry.imageData;
          };
          shareLinks.put(shareId, shareable);
        };
      };
      
      return [shareId];
    };
    
    public func revokeDreamShare(userId : Text, timestamp : Int) : Bool {
      var newLinks : [(Text, Text, Int)] = [];
      var removedShareId : ?Text = null;
      
      for ((shareId, uid, ts) in shareableLinks.vals()) {
        if (uid != userId or ts != timestamp) {
          newLinks := Array.append(newLinks, [(shareId, uid, ts)]);
        } else {
          removedShareId := ?shareId;
        };
      };
      
      var newShared : [(Text, Int)] = [];
      for ((uid, ts) in sharedDreams.vals()) {
        if (uid != userId or ts != timestamp) {
          newShared := Array.append(newShared, [(uid, ts)]);
        };
      };
      
      let removed = Iter.size(shareableLinks.vals()) > Iter.size(newLinks.vals());
      shareableLinks := newLinks;
      sharedDreams := newShared;
      
      switch (removedShareId) {
        case (null) {};
        case (?id) { shareLinks.delete(id); };
      };
      
      return removed;
    };
    
    public func revokeAllSharesForDream(userId : Text, timestamp : Int) : Bool {
        return revokeDreamShare(userId, Int.abs(timestamp));
    };
    
    public func getSharedDream(shareId : Text) : ?Types.ShareableDreamEntry {
      shareLinks.get(shareId)
    };
    
    public func getShareLinksForUser(user : Text) : [(Text, Types.ShareableDreamEntry)] {
      let userLinks = Iter.filter<(Text, Types.ShareableDreamEntry)>(
        shareLinks.entries(), 
        func((_, entry)) : Bool { entry.originalUser == user }
      );
      
      return Iter.toArray(userLinks);
    };
    
    public func deleteShareLink(user : Text, shareId : Text) : Bool {
      switch (shareLinks.get(shareId)) {
        case (null) { 
          return false;
        };
        case (?entry) {
          if (entry.originalUser != user) {
            return false;
          };
          
          shareLinks.delete(shareId);
          
          var newLinks : [(Text, Text, Int)] = [];
          for ((sid, uid, ts) in shareableLinks.vals()) {
            if (sid != shareId) {
              newLinks := Array.append(newLinks, [(sid, uid, ts)]);
            };
          };
          
          shareableLinks := newLinks;
          
          return true;
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

    public func getAllShares() : [(Text, [(Text, Types.ShareableDreamEntry)])] {
        let entries = Iter.toArray(userShares.entries());
        Array.map<(Text, HashMap.HashMap<Text, Types.ShareableDreamEntry>), (Text, [(Text, Types.ShareableDreamEntry)])>(
            entries,
            func(entry) {
                let (user, sharesMap) = entry;
                (user, Iter.toArray(sharesMap.entries()))
            }
        )
    };
    
    private var stableShareLinksEntries : [(Text, Types.ShareableDreamEntry)] = [];
    private var stableShareableLinks : [(Text, Text, Int)] = [];
    private var stableSharedDreams : [(Text, Int)] = [];
    
    public func preupgrade() {
      stableShareLinksEntries := Iter.toArray(shareLinks.entries());
      stableShareableLinks := shareableLinks;
      stableSharedDreams := sharedDreams;
    };
    
    public func postupgrade() {
      shareLinks := HashMap.fromIter<Text, Types.ShareableDreamEntry>(
        stableShareLinksEntries.vals(), 10, Text.equal, Text.hash
      );
      shareableLinks := stableShareableLinks;
      sharedDreams := stableSharedDreams;
    };
  };
}