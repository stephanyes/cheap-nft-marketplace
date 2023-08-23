import Joi, { Schema } from 'joi';

interface IListNftSchema {
  tokenId: number;
  price: number;
  isAuction: boolean;
  sellerAddress: string;
  collectionAddress: string;
  erc20Address: string;
}

const listNftSchema = Joi.object<IListNftSchema>({
  tokenId: Joi.number().required(),
  price: Joi.number().required(),
  isAuction: Joi.boolean().required(),
  sellerAddress: Joi.string().required(),
  collectionAddress: Joi.string().required(),
  erc20Address: Joi.string().required(),
});

const placeBidSchema: Schema = Joi.object({
  tokenId: Joi.string().required(),
  bidAmount: Joi.number().required(),
  buyerAddress: Joi.string().required(),
});

const signatureSchema: Schema = Joi.object({
  privateKey: Joi.string().required(),
  collectionAddress: Joi.string().required(),
  erc20Address: Joi.string().required(),
  tokenId: Joi.number().required(),
  bid: Joi.number().required(),
  offerSignedMessage: Joi.string().optional(),
});

const listingIdSchema: Schema = Joi.object({
  listingId: Joi.number().required(),
});

export {
  listNftSchema,
  placeBidSchema,
  signatureSchema,
  listingIdSchema,
};
