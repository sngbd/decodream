import Array "mo:base/Array";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Order "mo:base/Order";

actor Decodream {
  public type DreamEntry = {
    dreamText : Text;
    analysis : Text;
    timestamp : Int;
    user : Text;
    lastUpdated : Int;
  };
  
  stable var dreamEntries : [DreamEntry] = [];
  
  private var dreamsByUser = HashMap.HashMap<Text, [DreamEntry]>(
    10, Text.equal, Text.hash
  );
  
  system func preupgrade() {
    dreamEntries := getAllDreams();
  };
  
  system func postupgrade() {
    for (entry in dreamEntries.vals()) {
      let userDreams = switch (dreamsByUser.get(entry.user)) {
        case (null) { [entry] };
        case (?existing) { Array.append(existing, [entry]) };
      };
      dreamsByUser.put(entry.user, userDreams);
    };
  };
  
  public func addDreamEntry(entry : DreamEntry) : async () {
    let completeEntry : DreamEntry = {
      dreamText = entry.dreamText;
      analysis = entry.analysis;
      timestamp = entry.timestamp;
      user = entry.user;
      lastUpdated = entry.timestamp;
    };
    
    let userDreams = switch (dreamsByUser.get(entry.user)) {
      case (null) { [completeEntry] };
      case (?existing) { Array.append(existing, [completeEntry]) };
    };
    dreamsByUser.put(entry.user, userDreams);
  };
  
  public query func getDreamEntriesByUser(userPrincipal : Text) : async [DreamEntry] {
    switch (dreamsByUser.get(userPrincipal)) {
      case (null) { [] };
      case (?entries) {
        let sortedEntries = Array.sort<DreamEntry>(
          entries, 
          func(a, b) : Order.Order {
            if (a.timestamp > b.timestamp) return #less;
            if (a.timestamp < b.timestamp) return #greater;
            return #equal;
          }
        );
        sortedEntries
      };
    };
  };
  
  private func getAllDreams() : [DreamEntry] {
    var allDreams : [DreamEntry] = [];
    for ((_, userDreams) in dreamsByUser.entries()) {
      allDreams := Array.append(allDreams, userDreams);
    };
    allDreams
  };
  
  public func updateDreamEntry(user : Text, timestamp : Int, dreamText : Text, analysis : Text, updateTimestamp : Int) : async Bool {
    switch (dreamsByUser.get(user)) {
      case (null) { return false };
      case (?entries) {
        let updatedEntries = Array.map<DreamEntry, DreamEntry>(entries, func(entry) {
          if (entry.timestamp == timestamp) {
            return {
              dreamText = dreamText;
              analysis = analysis;
              timestamp = timestamp;
              user = user;
              lastUpdated = updateTimestamp;
            };
          } else {
            return entry;
          };
        });
        
        dreamsByUser.put(user, updatedEntries);
        return true;
      };
    };
  };
  
  public func deleteDreamEntry(user : Text, timestamp : Int) : async Bool {
    switch (dreamsByUser.get(user)) {
      case (null) { return false };
      case (?entries) {
        let filteredEntries = Array.filter<DreamEntry>(entries, func(entry) {
          entry.timestamp != timestamp
        });
        
        dreamsByUser.put(user, filteredEntries);
        return true;
      };
    };
  };
}