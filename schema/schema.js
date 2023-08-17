const Joi = require('joi');

const listNftSchema = Joi.object({
  tokenId: Joi.number().required(),
  price: Joi.number().required(), // If it's an auction, this could be the starting bid
  isAuction: Joi.boolean().required(),
  sellerAddress: Joi.string().required(),
  collectionAddress: Joi.string().required(),
  erc20Address: Joi.string().required(),
});

const placeBidSchema = Joi.object({
  tokenId: Joi.string().required(),
  bidAmount: Joi.number().required(), // This could represent the bid amount or purchase price
  buyerAddress: Joi.string().required(),
});

const signatureSchema = Joi.object({
  privateKey: Joi.string().required(),
  collectionAddress: Joi.string().required(),
  erc20Address: Joi.string().required(),
  tokenId: Joi.number().required(),
  bid: Joi.number().required(),
  offerSignedMessage: Joi.string().optional(),
});

const listingIdSchema = Joi.object({
  listingId: Joi.number().required(),
});

module.exports = {
  listNftSchema,
  placeBidSchema,
  signatureSchema,
  listingIdSchema,
};
