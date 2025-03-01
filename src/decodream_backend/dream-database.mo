import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Order "mo:base/Order";
import Text "mo:base/Text";
import Types "./types";

module {
  public class DreamDatabase() {
    private var dreamsByUser = HashMap.HashMap<Text, [Types.DreamEntry]>(
      10, Text.equal, Text.hash
    );

    public func addEntry(entry : Types.DreamEntry) {
      let completeEntry : Types.DreamEntry = {
        dreamText = entry.dreamText;
        analysis = entry.analysis;
        timestamp = entry.timestamp;
        user = entry.user;
        lastUpdated = entry.timestamp;
        imageData = entry.imageData;
      };

      let userDreams = switch (dreamsByUser.get(entry.user)) {
        case (null) { [completeEntry] };
        case (?existing) { Array.append(existing, [completeEntry]) };
      };
      
      dreamsByUser.put(entry.user, userDreams);
    };

    public func getEntriesByUser(userPrincipal : Text) : [Types.DreamEntry] {
      switch (dreamsByUser.get(userPrincipal)) {
        case (null) { [] };
        case (?entries) {
          let sortedEntries = Array.sort<Types.DreamEntry>(
            entries,
            func(a, b) : Order.Order {
              if (a.timestamp > b.timestamp) return #less;
              if (a.timestamp < b.timestamp) return #greater;
              return #equal;
            }
          );
          sortedEntries
        };
      }
    };

    public func updateEntry(
      user : Text, 
      timestamp : Int, 
      dreamText : Text, 
      analysis : Text, 
      updateTimestamp : Int,
      imageData : Text
    ) : Bool {
      switch (dreamsByUser.get(user)) {
        case (null) { return false };
        case (?entries) {
          let updatedEntries = Array.map<Types.DreamEntry, Types.DreamEntry>(
            entries,
            func(entry) {
              if (entry.timestamp == timestamp) {
                return {
                  dreamText = dreamText;
                  analysis = analysis;
                  timestamp = timestamp;
                  user = user;
                  lastUpdated = updateTimestamp;
                  imageData = imageData;
                };
              } else {
                return entry;
              }
            }
          );
          
          dreamsByUser.put(user, updatedEntries);
          return true;
        };
      }
    };

    public func deleteEntry(user : Text, timestamp : Int) : Bool {
      switch (dreamsByUser.get(user)) {
        case (null) { return false };
        case (?entries) {
          let filteredEntries = Array.filter<Types.DreamEntry>(
            entries,
            func(entry) { entry.timestamp != timestamp }
          );
          
          dreamsByUser.put(user, filteredEntries);
          return true;
        };
      }
    };

    public func getAllEntries() : [Types.DreamEntry] {
      var allDreams : [Types.DreamEntry] = [];
      for ((_, userDreams) in dreamsByUser.entries()) {
        allDreams := Array.append(allDreams, userDreams);
      };
      allDreams
    };

    public func populateFromEntries(entries : [Types.DreamEntry]) {
      for (entry in entries.vals()) {
        let userDreams = switch (dreamsByUser.get(entry.user)) {
          case (null) { [entry] };
          case (?existing) { Array.append(existing, [entry]) };
        };
        dreamsByUser.put(entry.user, userDreams);
      }
    };
  }
}