import express, { Request, Response } from 'express';
import { validateBody, validateQuery } from '../middleware/validateBody.ts';
import {
  listNftSchema, placeBidSchema, signatureSchema, listingIdSchema,
} from '../schema/schema.ts';
import NftController from '../controller/controller.ts';

const router = express.Router();

// ********* GET *********
router.get('/api/all-listings', NftController.listings);
router.get('/api/listing', validateQuery(listingIdSchema), NftController.listingById);
router.get('/api/health', (req: Request, res: Response) => res.send('OK'));

// ********* POST *********
router.post('/api/createListing', validateBody(listNftSchema), NftController.createListing);
router.post('/api/finishAuction', NftController.finishAuction);
router.post('/api/placeBid', validateBody(placeBidSchema), NftController.placeBid);
router.post('/api/mintToken', NftController.mint);
router.post('/api/sign', validateBody(signatureSchema), NftController.sign);
router.post('/api/seed', NftController.seed);

export default router;
