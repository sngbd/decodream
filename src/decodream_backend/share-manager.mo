import DreamDatabase "./dream-database";
import Types "./types";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Random "mo:base/Random";

module {
  public class ShareManager(db: DreamDatabase.DreamDatabase, initialShares: [Types.ShareableDreamEntry]) {
    private var sharedDreams : [Types.ShareableDreamEntry] = initialShares;
    
    public func isDreamShared(userId : Text, timestamp : Int) : Bool {
      for (sd in sharedDreams.vals()) {
        if (sd.user == userId and sd.timestamp == timestamp) {
          return true;
        };
      };
      return false;
    };
    
    public func createShareableLink(userId : Text, timestamp : Int) : async Text {
      let isAlreadyShared = isDreamShared(userId, timestamp);
      
      if (isAlreadyShared) {
        for (sd in sharedDreams.vals()) {
          if (sd.user == userId and sd.timestamp == timestamp) {
            return sd.shareId;
          };
        };
      };
      
      let shareId = await generateShareId();

      let newShare : Types.ShareableDreamEntry = {
        user = userId;
        timestamp = timestamp;
        shareId = shareId;
      };
      
      sharedDreams := Array.append(sharedDreams, [newShare]);
      
      return shareId;
    };
    
    public func revokeDreamShare(userId : Text, timestamp : Int) : Bool {
      let initialSize = sharedDreams.size();
      
      sharedDreams := Array.filter<Types.ShareableDreamEntry>(
        sharedDreams, 
        func(sd) {
          not (sd.user == userId and sd.timestamp == timestamp)
        }
      );
      
      return initialSize > sharedDreams.size();
    };
    
    public func revokeAllSharesForDream(userId : Text, timestamp : Int) : Bool {
      return revokeDreamShare(userId, timestamp);
    };
    
    public func getSharedDream(shareId : Text) : ?Types.DreamEntry {
      for (sd in sharedDreams.vals()) {
        if (sd.shareId == shareId) {
          return db.getEntryByTimestamp(sd.user, sd.timestamp);
        };
      };
      return null;
    };
    
    func chooseMax(f : Random.Finite, max : Nat) : ?Nat {
      assert max > 0;
      do ? {
        var n = max - 1 : Nat;
        var k = 0;
        while (n != 0) {
          k *= 2;
          k += if (f.coin()!) 1 else 0;
          n /= 2;
        };
        if (k < max) k else chooseMax(f, max)!;
      };
    };

    public func generateShareId() : async Text {
      let alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let chars = Iter.toArray(Text.toIter(alphanumeric));

      var id = "";
      var f = Random.Finite(await Random.blob());

      for (_ in Iter.range(0, 7)) {
        switch (chooseMax(f, 62)) {
          case (?index) {
            id #= Text.fromChar(chars[index]);
          };
          case null {
            f := Random.Finite(await Random.blob());
          };
        };
      };

      id;
    };

    public func getAllShares() : [Types.ShareableDreamEntry] {
      return sharedDreams;
    };

    public func populateFromShares(savedShares: [Types.ShareableDreamEntry]) {
      sharedDreams := savedShares;
    };
  };
}