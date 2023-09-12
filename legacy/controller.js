// /* eslint-disable max-len */
// const NftService = require('../service/service');

// const NftController = {
//   createListing: async (req, res) => {
//     try {
//       const newListing = await NftService.createListing(req.body);
//       res.status(201).json(newListing);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },
//   // eslint-disable-next-line consistent-return
//   finishAuction: async (req, res) => {
//     const {
//       senderAccount, listingId, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB,
//     } = req.body;
//     const allListings = await NftService.getListings();
//     const listing = allListings.find((item) => item.tokenId === listingId);
//     if (!listing) {
//       return res.status(404).json({ error: 'Listing not found' });
//     }
//     try {
//       const obj = {
//         tokenId: listingId, bid: listing.price, collectionAddress: listing.collectionAddress, erc20Address: listing.erc20Address, privateKey: privateKeyA,
//       };
//       const test = await NftService.prepareData(obj);
//       const receipt = await NftService.finishAuction(senderAccount, test, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB, obj);
//       res.json({ success: true, receipt });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to finishAuction()', details: error.message });
//     }
//   },
//   listings: async (req, res) => {
//     try {
//       res.status(200).json(await NftService.getListings());
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
//   listingById: async (req, res) => {
//     try {
//       const listingId = parseInt(req.query.listingId, 10);
//       res.status(200).json(await NftService.getListingById(listingId));
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
//   mint: async (req, res) => {
//     try {
//       const test = await NftService.mintToken(req.body);
//       res.status(200).json(test);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },
//   seed: async (req, res) => {
//     try {
//       const result = await NftService.seedListings();
//       if (result.success) {
//         res.status(200).send(result.message);
//       } else {
//         res.status(400).send({ message: result.message });
//       }
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },
//   placeBid: async (req, res) => {
//     try {
//       const updatedListing = await NftService.placeBid(req.body);
//       if (updatedListing.success) {
//         res.status(200).send(updatedListing.data);
//       } else {
//         res.status(400).send({ message: updatedListing.message });
//       }
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },
//   sign: async (req, res) => {
//     const formattedData = await NftService.prepareData(req.body);
//     try {
//       const signature = await NftService.sign(formattedData);
//       res.status(200).json({ signature: signature.signature });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },
// };

// module.exports = NftController;
