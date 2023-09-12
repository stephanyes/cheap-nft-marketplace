/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { Request, Response } from 'express';
import NftService from '../service/service.ts';

interface ServiceResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export default class NftController {
  static async createListing(req: Request, res: Response): Promise<void> {
    try {
      const newListing = await NftService.createListing(req.body);
      res.status(201).json(newListing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async finishAuction(req: Request, res: Response): Promise<void> {
    const {
      senderAccount, listingId, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB,
    } = req.body;

    const allListings = await NftService.getListings();
    const listing = allListings.find((item) => item.tokenId === listingId);

    if (!listing) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    try {
      const obj = {
        tokenId: listingId, bid: listing.price, collectionAddress: listing.collectionAddress, erc20Address: listing.erc20Address, privateKey: privateKeyA,
      };
      const receipt = await NftService.finishAuction({
        senderAccount, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB, obj,
      });
      res.json({ success: true, receipt });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to finishAuction()', details: error.message });
    }
  }

  static async listings(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json(await NftService.getListings());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async listingById(req: Request, res: Response): Promise<void> {
    try {
      const listingId = parseInt(req.query.listingId as string, 10);
      res.status(200).json(await NftService.getListingById(listingId));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async mint(req: Request, res: Response): Promise<void> {
    try {
      const test: ServiceResponse = await NftService.mintToken(req.body);
      res.status(200).json(test);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async seed(req: Request, res: Response): Promise<void> {
    try {
      const result: ServiceResponse = await NftService.seedListings();
      if (result.success) {
        res.status(200).send(result.message);
      } else {
        res.status(400).send({ message: result.message });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async placeBid(req: Request, res: Response): Promise<void> {
    try {
      const updatedListing: ServiceResponse = await NftService.placeBid(req.body);
      if (updatedListing.success) {
        res.status(200).send(updatedListing.data);
      } else {
        res.status(400).send({ message: updatedListing.message });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async sign(req: Request, res: Response): Promise<void> {
    const formattedData = await NftService.prepareData(req.body);
    try {
      const signature = await NftService.sign(formattedData);
      res.status(200).json({ signature: signature.signature });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
