const express = require("express");
const { validateBody } = require("./utils");
const { listNftSchema, placeBidSchema, signatureSchema } = require("./schema");
const NftController = require("./controller");
const router = express.Router();

router.get("/api/all-listings", NftController.listings);
router.get("/api/accounts", NftController.accounts);
router.post( "/api/createListing", validateBody(listNftSchema), NftController.createListing);
router.post( "/api/placeBid", validateBody(placeBidSchema), NftController.placeBid);
router.post("/api/mintToken", NftController.testingMint)
router.post("/api/sign", validateBody(signatureSchema), NftController.sign);
router.post("/api/finalize-trade", NftController.finalizeTrade);

module.exports = router;
