const listings = [];

const NftController = {
  createListing: (req, res) => {
    const { sellerAddress, isAuction, price, tokenID, tokenAddress } = req.body;

    const newListing = {
      id: listings.length + 1,
      sellerAddress,
      isAuction,
      price,
      tokenID,
      tokenAddress,
    };

    listings.push(newListing);

    res.status(201).json(newListing);
  },

  placeBid: (req, res) => {
    const { buyAddress, tokenID, bidAmount } = req.body;

    const listing = listings.find((listing) => listing.tokenID === tokenID);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if (listing.isAuction && bidAmount > listing.price) {
      listing.price = bidAmount;
      listing.buyAddress = buyAddress;
    } else if (!listing.isAuction && price === listing.price) {
      listing.buyAddress = buyAddress;
    } else {
      return res.status(400).json({ error: "Invalid bid" });
    }

    res.status(200).json(listing);
  },

  listings: (req, res) => {
    res.status(200).json(listings);
  },
};

module.exports = NftController;
