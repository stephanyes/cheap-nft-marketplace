const express = require("express");
const { validateBody } = require("../middleware/validateBody");
const { listNftSchema, placeBidSchema, signatureSchema } = require("../schema/schema");
const NftController = require("../controller/controller");
const router = express.Router();

// ********* GET *********
router.get("/api/all-listings", NftController.listings);
router.get("/api/listingId", NftController.listingById);
router.get("/api/health", (req, res) => res.send("OK"));

// ********* POST *********
router.post("/api/createListing", validateBody(listNftSchema), NftController.createListing);
router.post("/api/finishAuction", NftController.finishAuction);
router.post("/api/placeBid", validateBody(placeBidSchema), NftController.placeBid);
router.post("/api/mintToken", NftController.mint)
router.post("/api/sign", validateBody(signatureSchema), NftController.sign);
router.post("/api/seed", NftController.seed);

module.exports = router;
