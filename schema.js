const Joi = require("joi");

const listNftSchema = Joi.object({
  tokenID: Joi.string().required(),
  price: Joi.number().required(), // If it's an auction, this could be the starting bid
  isAuction: Joi.boolean().required(),
  sellerAddress: Joi.string().required(),
  //   auctionEndsAt: Joi.date().when("isAuction", {
  //     is: Joi.valid(true),
  //     then: Joi.required(),
  //     otherwise: Joi.optional(),
  //   }),
});

const placeBidSchema = Joi.object({
  tokenID: Joi.string().required(),
  bidAmount: Joi.number().required(), // This could represent the bid amount or purchase price
  buyAddress: Joi.string().required(),
});

module.exports = {
  listNftSchema,
  placeBidSchema,
};
