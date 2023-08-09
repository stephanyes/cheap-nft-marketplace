const NftService = require("./service");

const NftController = {
  createListing: (req, res) => {
    try {
      const newListing = NftService.createListing(req.body);
      res.status(201).json(newListing);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  placeBid: (req, res) => {
    try {
      const updatedListing = NftService.placeBid(req.body);
      res.status(200).json(updatedListing);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  listings: (req, res) => {
    res.status(200).json(NftService.getListings());
  },

  accounts: (req, res) => {
    res.status(200).json(NftService.getAccounts());
  },

  sign: (req, res) => {
    const formattedData = NftService.prepareData(req.body);
    try {
      const signature = NftService.sign(formattedData);
      res.status(200).json({ signature: signature.signature });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  finalizeTrade: async (req, res) => {
    const {
      senderAccount,
      listingId,
      bidderSig,
      ownerApprovedSig,
      bidderAddress,
      privateKeyA,
      privateKeyB
    } = req.body;

    const allListings = NftService.getListings();
    const listing = allListings.find(
      (listing) => listing.tokenId === listingId
    );
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    const obj = {
      tokenId: listingId,
      bid: listing.price,
      collectionAddress: listing.collectionAddress,
      erc20Address: listing.erc20Address,
      privateKey: privateKeyA,
    };
    const test = NftService.prepareData(obj);

    try {
      const receipt = await NftService.finalizeTrade(
        senderAccount,
        test,
        bidderSig,
        ownerApprovedSig,
        bidderAddress,
        privateKeyA,
        privateKeyB,
        obj
      );
      res.json({ success: true, receipt });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to finalize trade", details: error.message });
    }
  },
};

module.exports = NftController;
