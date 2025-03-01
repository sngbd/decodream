import DreamDatabase "./dream-database";
import Text "mo:base/Text";
import Types "./types";

actor Decodream {
  stable var dreamEntries : [Types.DreamEntry] = [];
  
  private var db = DreamDatabase.DreamDatabase();
  
  system func preupgrade() {
    dreamEntries := db.getAllEntries();
  };
  
  system func postupgrade() {
    db.populateFromEntries(dreamEntries);
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
    db.deleteEntry(user, timestamp)
  };
}