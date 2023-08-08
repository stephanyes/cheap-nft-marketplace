const express = require("express");
const { validateBody } = require("./utils");
const { listNftSchema, placeBidSchema } = require("./schema");
const NftController = require("./controller");
const router = express.Router();

router.get("/api/listings", NftController.listings);
router.get("/api/accounts", NftController.accounts)
router.post(
  "/api/listings",
  validateBody(listNftSchema),
  NftController.createListing
);
router.post("/api/bids", validateBody(placeBidSchema), NftController.placeBid);

module.exports = router;
