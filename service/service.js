/* eslint-disable radix */
/* eslint-disable max-len */
// eslint-disable-next-line import/no-extraneous-dependencies
const { ethers, keccak256 } = require('ethers');
const {
  sendTransactionAndGetHash, mintToken, signTransaction, estimateTransactionGas, createTransactionObject, generateApprovalABI, checkBalances, signData, fetchTransactionCount,
} = require('../utils');
const {
  web3, contract, mockERC20Contract, mockERC721Contract, BN, getERC20Decimals,
} = require('../config/config');
const { CONTRACT_ADDRESS, ERC20, ERC721 } = require('../contracts/contracts');
const { storeListing, getAllListings, getListingById } = require('../redis/redis');
const logger = require('../pino/pino');

const listings = [];

const NftService = {
  getListings: async () => {
    try {
      const arr = await getAllListings();
      return arr;
    } catch (err) {
      logger.error('Failed to retrieve listings:', err);
      return [];
    }
  },

  getListingById: async (listingId) => {
    try {
      const listing = await getListingById(listingId);
      return listing;
    } catch (err) {
      logger.error(`Failed to retrieve listing with id: ${listingId}`, err);
      return [];
    }
  },
  createListing: async ({
    sellerAddress, collectionAddress, isAuction, price, tokenId, erc20Address,
  }) => {
    const newListing = {
      id: listings.length + 1, sellerAddress, isAuction, price, tokenId, erc20Address, collectionAddress,
    };
    listings.push(newListing);
    await storeListing(newListing);
    return newListing;
  },
  async placeBid({ buyerAddress, tokenId, bidAmount }) {
    const listingIndex = listings.findIndex((listing) => listing.tokenId === tokenId);
    if (listingIndex === -1) return { success: false, message: 'Listing not found' };
    // Check if the bid is the same as the existing bid for this listing
    const existingListing = listings[listingIndex];
    if (existingListing.buyerAddress === buyerAddress && existingListing.price === bidAmount) {
      return { success: false, message: 'Identical bid already exists' };
    }
    const updatedListing = this.processBid(existingListing, bidAmount, buyerAddress);
    if (!updatedListing) return { success: false, message: 'Failed to process bid' };
    listings[listingIndex] = updatedListing;
    await storeListing(updatedListing);
    return { success: true, data: updatedListing };
  },
  processBid(listing, bidAmount, buyerAddress) {
    const copyBidAmount = parseInt(bidAmount);
    if (listing.isAuction === 'true') {
      if (copyBidAmount >= parseInt(listing.price)) {
        // eslint-disable-next-line max-len
        return { ...listing, price: copyBidAmount.toString(), buyerAddress }; // The new bid is valid and higher than the current price.
      }
      throw new Error('Bid amount too low for auction');
    } else if (copyBidAmount === parseInt(listing.price)) {
      return { ...listing, buyerAddress, status: 'sold' };// The NFT is purchased at the listed fixed price.
    } else {
      throw new Error('Invalid amount for fixed price purchase');
    }
  },
  mintToken: async ({
    fromAddress, privateKey, toAddress, amount, token,
  }) => {
    try {
      const test = await mintToken(web3, fromAddress, privateKey, toAddress, amount, token);
      return test;
    } catch (error) {
      logger.error('Error:', error);
      throw error;
    }
  },
  sign: async ({ dataString, privateKey }) => {
    if (!dataString || !privateKey) {
      throw new Error('Data or private key missing');
    }
    const signature = await signData(web3, dataString, privateKey);
    return signature;
  },
  computeDataString(offerSignedMessage, messageHash) {
    return offerSignedMessage ? keccak256(offerSignedMessage) : keccak256(messageHash);
  },
  async prepareData(auctionData) {
    const {
      collectionAddress, erc20Address, tokenId, bid, privateKey, offerSignedMessage,
    } = auctionData;
    const erc20Decimals = await getERC20Decimals();
    const messageHash = ethers.solidityPacked(['address', 'address', 'uint256', 'uint256'], [collectionAddress, erc20Address, tokenId, ethers.parseUnits(bid, parseInt(erc20Decimals))]);
    const dataString = this.computeDataString(offerSignedMessage, messageHash);
    return { dataString, privateKey };
  },
  async getBalance(address) {
    const tokenContract = mockERC20Contract;
    const balance = await tokenContract.methods.balanceOf(address).call();
    logger.info(`Current balance of ${address}: ${balance}`);
  },
  async seedListings() {
    const redisListings = await getAllListings();
    redisListings.forEach((redisListing) => {
      const exists = listings.some((listing) => listing.id === redisListing.id);
      if (!exists) {
        listings.push(redisListing);
        logger.info('Pushing into listings');
      }
    });

    return { success: true, message: 'In memory listings seeded from redis' };
  },
  async finishAuction(senderAccount, listing, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB, obj) {
    const nonceA = await fetchTransactionCount(web3, senderAccount);
    const nonceB = await fetchTransactionCount(web3, bidderAddress);
    try {
      const erc20Decimals = await getERC20Decimals();
      const transformedBid = ethers.parseUnits(obj.bid, parseInt(erc20Decimals));
      const transformedTokenId = obj.tokenId;
      const currentGasPrice = await web3.eth.getGasPrice();
      const currentGasPriceBN = new BN(currentGasPrice);
      const adjustedGasPriceBN = currentGasPriceBN.mul(new BN(110)).div(new BN(100)); // increases the gas price by 10%
      const maxGas = process.env.MAX_GAS;
      logger.info('First gas price calculation done');
      // Estimate Gas for each tx
      const [gasEstimateERC721, gasEstimateERC20] = await Promise.all([estimateTransactionGas(mockERC721Contract, 'approve', [CONTRACT_ADDRESS, transformedTokenId], senderAccount), estimateTransactionGas(mockERC20Contract, 'approve', [CONTRACT_ADDRESS, transformedBid], bidderAddress)]);
      // For ERC20 and ERC721 approve
      const approveABIERC20 = generateApprovalABI(mockERC20Contract, 'approve', [CONTRACT_ADDRESS, transformedBid]);
      const approveABIERC721 = generateApprovalABI(mockERC721Contract, 'approve', [CONTRACT_ADDRESS, transformedTokenId]);
      logger.info('Generated Approval ABI for ERC20 & ERC721 done');
      // Check for users balance before attempting to perform a tx
      logger.info('Checking balances of both users...');
      await checkBalances(web3, senderAccount, 'seller', ERC20, transformedBid, gasEstimateERC721, adjustedGasPriceBN);
      await checkBalances(web3, bidderAddress, 'bidder', ERC20, transformedBid, gasEstimateERC20, adjustedGasPriceBN);
      logger.info('Balances done');
      const transaction1 = createTransactionObject({
        web3, nonce: nonceA, from: senderAccount, to: ERC721, data: approveABIERC721, gasEstimate: gasEstimateERC721, gasPrice: adjustedGasPriceBN, maxGasLimit: maxGas,
      });
      const transaction2 = createTransactionObject({
        web3, nonce: nonceB, from: bidderAddress, to: ERC20, data: approveABIERC20, gasEstimate: gasEstimateERC20, gasPrice: adjustedGasPriceBN, maxGasLimit: maxGas,
      });
      const [signedTx1, signedTx2] = await Promise.all([signTransaction(web3, transaction1, privateKeyA), signTransaction(web3, transaction2, privateKeyB)]);
      logger.info('First two transactions sign done');
      // Sending the ERC721 and ERC20 approval transactions concurrently
      const [tx1Receipt, tx2Receipt] = await Promise.all([sendTransactionAndGetHash(web3, signedTx1), sendTransactionAndGetHash(web3, signedTx2)]);
      logger.info('transaction1 & transaction2 sent and hash retrieved');
      // Buyer wants NFT
      const marketPlaceAction = generateApprovalABI(contract, 'finishAuction', [[obj.collectionAddress, obj.erc20Address, transformedTokenId, transformedBid], bidderSig, ownerApprovedSig]);
      logger.info('Generated FinishAuction ABI done');
      // New nonce needed from sender because of the transaction above
      const nonceD = await fetchTransactionCount(web3, senderAccount, 'pending');
      logger.info('Calculating new nonce for sender');
      const currentGasPrice2 = await web3.eth.getGasPrice();
      const currentGasPriceBN2 = new BN(currentGasPrice2);
      logger.info('Second gas price calculation done');
      const adjustedGasPriceBN2 = currentGasPriceBN2.mul(new BN(120)).div(new BN(100)); // increases the gas price by 20%
      const gasEstimateMarketplace = await estimateTransactionGas(contract, 'finishAuction', [[obj.collectionAddress, obj.erc20Address, transformedTokenId, transformedBid], bidderSig, ownerApprovedSig], senderAccount);
      logger.info('Gas estimated for finishAuction done');
      const transaction3 = createTransactionObject({
        web3, nonce: nonceD, from: senderAccount, to: CONTRACT_ADDRESS, data: marketPlaceAction, gasEstimate: gasEstimateMarketplace, gasPrice: adjustedGasPriceBN2, maxGasLimit: maxGas,
      });
      const signedTx3 = await signTransaction(web3, transaction3, privateKeyA);
      const tx3Receipt = await sendTransactionAndGetHash(web3, signedTx3);
      await this.markListingAsSold(obj.tokenId);
      logger.info(`NFT Marketplace ${CONTRACT_ADDRESS} executed finishAuction() successfully`);
      logger.info(`Auction finished between Owner: ${senderAccount} & Buyer: ${bidderAddress}`);
      return { transaction1: tx1Receipt, transaction2: tx2Receipt, transaction3: tx3Receipt };
    } catch (error) {
      logger.error('Error:', error);
      throw error;
    }
  },
  markListingAsSold: async function markListingAsSold(tokenId) {
    const listingIndex = listings.findIndex((l) => l.tokenId === tokenId);
    if (listingIndex !== -1) {
      listings[listingIndex].status = 'sold';
      await storeListing(listings[listingIndex]);
      logger.info(`The following token id: ${listings[listingIndex].tokenId} has been sold out`);
    }
  },
};

module.exports = NftService;
