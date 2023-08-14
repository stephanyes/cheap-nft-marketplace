const express = require("express");
const { validateBody } = require("../utils");
const { listNftSchema, placeBidSchema, signatureSchema } = require("../schema");
const NftController = require("../controller/controller");
const router = express.Router();

// ********* GET *********
router.get("/api/all-listings", NftController.listings);

// ********* POST *********
router.post("/api/createListing", validateBody(listNftSchema), NftController.createListing);
router.post("/api/finishAuction", NftController.finishAuction);
router.post("/api/placeBid", validateBody(placeBidSchema), NftController.placeBid);
router.post("/api/mintToken", NftController.mint)
router.post("/api/sign", validateBody(signatureSchema), NftController.sign);

module.exports = router;
