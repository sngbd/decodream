import Text "mo:base/Text";

module {
  public type DreamEntry = {
    dreamText : Text;
    analysis : Text;
    timestamp : Int;
    user : Text;
    lastUpdated : Int;
    imageData : Text;
  };
}