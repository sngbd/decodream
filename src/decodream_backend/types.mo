import Principal "mo:base/Principal";

module {
  public type DreamEntry = {
    user : Text;
    timestamp : Int;
    dreamText : Text;
    analysis : Text;
    created : Int;
    updated : Int;
    imageData : Text;
  };
  
  public type ShareableDreamEntry = {
    originalUser : Text;
    originalTimestamp : Int;
    dreamText : Text;
    analysis : Text;
    created : Int;
    updated : Int;
    imageData : Text;
  };
  
  public type AttributeValue = {
    #text : Text;
    #int : Int;
  };
  
  public type Metadata = {
    name : Text;
    description : Text;
    image : Text;
    attributes : [(Text, AttributeValue)];
  };
  
  public type DreamNFT = {
    tokenId : Nat;
    owner : Principal;
    dreamTimestamp : Int;
    metadata : Metadata;
    minted : Int;
  };
  
  public type Account = {
    owner : Principal;
    subaccount : ?[Nat8];
  };
  
  public type Collection = {
    name : Text;
    symbol : Text;
    royalties : Nat;
    royaltyRecipient : Account;
    description : Text;
    image : Text;
    totalSupply : Nat;
  };
  
  public type TransferError = {
    #Unauthorized;
    #InvalidToken;
    #InvalidRecipient;
  };
  
  public type TransferResult = {
    #Ok : Nat;
    #Err : TransferError;
  };
}