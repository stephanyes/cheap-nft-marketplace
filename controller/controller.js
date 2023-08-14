const NftService = require("../service/service");
const { getListing } = require("../redis/redis")
const NftController = {
  createListing: async (req, res) => {
    try {
      const newListing = await NftService.createListing(req.body);
      res.status(201).json(newListing);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  finishAuction: async (req, res) => {
    const { senderAccount, listingId, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB } = req.body;
    const allListings = NftService.getListings();
    const listing = allListings.find((listing) => listing.tokenId === listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    try {
      const obj = { tokenId: listingId, bid: listing.price, collectionAddress: listing.collectionAddress, erc20Address: listing.erc20Address, privateKey: privateKeyA };
      const test = await NftService.prepareData(obj);
      const receipt = await NftService.finishAuction( senderAccount, test, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB, obj);
      res.json({ success: true, receipt });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Failed to finish trade", details: error.message });
    }
  },
  listings: async (req, res) => {
    res.status(200).json(await NftService.getListings());
  },
  mint: async (req, res) => {
    try {
      const test = await NftService.mintTokens(req.body)
      res.status(200).json(test)
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
  sign: async (req, res) => {
    const formattedData = await NftService.prepareData(req.body);
    try {
      const signature = await NftService.sign(formattedData);
      res.status(200).json({ signature: signature.signature });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = NftController;
