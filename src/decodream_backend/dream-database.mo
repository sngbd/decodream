import Types "./types";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Array "mo:base/Array";

module {
  public class DreamDatabase(initialEntries : [Types.DreamEntry]) {
    private var entries : [Types.DreamEntry] = initialEntries;
    
    public func addEntry(entry : Types.DreamEntry) {
      entries := Array.append(entries, [entry]);
    };
    
    public func getEntriesByUser(userPrincipal : Text) : [Types.DreamEntry] {
      Array.filter<Types.DreamEntry>(entries, func(entry) {
        entry.user == userPrincipal
      });
    };
    
    public func getEntryByTimestamp(user : Text, timestamp : Int) : ?Types.DreamEntry {
      for (entry in entries.vals()) {
        if (entry.user == user and entry.timestamp == timestamp) {
          return ?entry;
        };
      };
      return null;
    };
    
    public func updateEntry(
      user : Text, 
      timestamp : Int, 
      dreamText : Text, 
      analysis : Text, 
      updateTimestamp : Int,
      imageData : Text
    ) : Bool {
      var updated = false;
      let updatedEntries = Array.map<Types.DreamEntry, Types.DreamEntry>(
        entries, func(entry) : Types.DreamEntry {
          if (entry.user == user and entry.timestamp == timestamp) {
            updated := true;
            return {
              user = entry.user;
              timestamp = entry.timestamp;
              dreamText = dreamText;
              analysis = analysis;
              created = entry.created;
              updated = updateTimestamp;
              imageData = imageData;
            };
          } else {
            return entry;
          };
        }
      );
      
      entries := updatedEntries;
      return updated;
    };
    
    public func deleteEntry(user : Text, timestamp : Int) : Bool {
      let initialSize = entries.size();
      entries := Array.filter<Types.DreamEntry>(
        entries, func(entry) : Bool { 
          not (entry.user == user and entry.timestamp == timestamp)
        }
      );
      return initialSize > entries.size();
    };
    
    public func getAllEntries() : [Types.DreamEntry] {
      return entries;
    };
    
    public func populateFromEntries(savedEntries : [Types.DreamEntry]) {
      entries := savedEntries;
    };
  };
}