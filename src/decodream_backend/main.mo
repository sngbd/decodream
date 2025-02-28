import DreamDatabase "./dream-database";
import Text "mo:base/Text";
import Types "./types";

actor Decodream {
  // Stable storage for upgrade persistence
  stable var dreamEntries : [Types.DreamEntry] = [];
  
  // Initialize the database
  private var db = DreamDatabase.DreamDatabase();
  
  // Lifecycle hooks for canister upgrades
  system func preupgrade() {
    dreamEntries := db.getAllEntries();
  };
  
  system func postupgrade() {
    db.populateFromEntries(dreamEntries);
  };
  
  // Public API methods
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
    updateTimestamp : Int
  ) : async Bool {
    db.updateEntry(user, timestamp, dreamText, analysis, updateTimestamp)
  };
  
  public func deleteDreamEntry(user : Text, timestamp : Int) : async Bool {
    db.deleteEntry(user, timestamp)
  };
}