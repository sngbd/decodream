import Types "./types";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import NFTManager "./nft-manager";

module {
  public class GalleryManager(initialGalleries: [(Text, Bool)], nftManager: NFTManager.NFTManager) {
    private var galleryStatus = HashMap.fromIter<Text, Bool>(
      initialGalleries.vals(), 10, Text.equal, Text.hash
    );

    private var publicGalleries : [(Text, Bool)] = [];

    public func preupgrade() {
      publicGalleries := Iter.toArray(galleryStatus.entries());
    };

    public func postupgrade() {
      galleryStatus := HashMap.fromIter<Text, Bool>(
        publicGalleries.vals(), 10, Text.equal, Text.hash
      );
    };

    public func toggleGallerySharing(principal : Text, isPublic : Bool) : Bool {
      galleryStatus.put(principal, isPublic);
      return true;
    };

    public func isGalleryPublic(principal : Text) : Bool {
      switch (galleryStatus.get(principal)) {
        case (null) { false };
        case (?status) { status };
      };
    };

    public func getPublicGallery(principal : Text) : [Types.DreamNFT] {
      let isPublic = switch (galleryStatus.get(principal)) {
        case (null) { false };
        case (?status) { status };
      };
      
      if (not isPublic) {
        return [];
      };
      
      let nfts = nftManager.getUserDreamNFTs(principal);
      
      return nfts;
    };

    public func getAllGalleries() : [(Text, Bool)] {
      Iter.toArray(galleryStatus.entries())
    };
  }
}
