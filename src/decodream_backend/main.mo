import Array "mo:base/Array";

actor {
  public type DreamEntry = {
    dreamText : Text;
    analysis : Text;
    timestamp : Int;
    user : Text;
  };

  var dreams : [DreamEntry] = [];

  public func addDreamEntry(entry : DreamEntry) : async () {
    dreams := Array.append(dreams, [entry]);
  };

  public query func getDreamEntries() : async [DreamEntry] {
    dreams
  };
};