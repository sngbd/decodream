module {
  public type DreamEntry = {
    dreamText : Text;
    analysis : Text;
    timestamp : Int;
    user : Text;
    lastUpdated : Int;
    imageData : Text;
  };
  
  public type ShareableDreamEntry = {
    dreamText : Text;
    analysis : Text;
    timestamp : Int;
    lastUpdated : Int;
    imageData : Text;
    originalUser : Text;
    originalTimestamp : Int;
    created : Int;
  };

  public type Account = {
    owner : Principal;
    subaccount : ?[Nat8];
  };

  public type Metadata = {
    name : Text;
    description : Text;
    image : Text;
    attributes : [(Text, Value)];
  };

  public type Value = {
    #text : Text;
    #nat : Nat;
    #nat8 : Nat8;
    #int : Int;
    #float : Float;
    #principal : Principal;
    #bool : Bool;
    #array : [Value];
    #map : [(Text, Value)];
    #blob : Blob;
  };

  public type Collection = {
    name : Text;
    symbol : Text;
    royalties : Nat16;
    royaltyRecipient : Account;
    description : Text;
    image : Text;
    totalSupply : Nat;
  };

  public type TransferArgs = {
    from_subaccount : ?[Nat8];
    to : Account;
    token_id : Nat;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type TransferResult = {
    #Ok : Nat;
    #Err : TransferError;
  };

  public type TransferError = {
    #Unauthorized;
    #TooOld;
    #CreatedInFuture;
    #Duplicate;
    #GenericError : { message : Text; error_code : Nat };
    #InvalidToken;
    #Rejected;
  };

  public type DreamNFT = {
    tokenId : Nat;
    owner : Principal;
    dreamTimestamp : Int;
    metadata : Metadata;
    minted : Int;
  };
}