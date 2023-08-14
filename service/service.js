const { sendTxAndGetHash, mintTokens, signTx, estimateGas, createTxObject, generateApprovalABI, checkBalances, sign } = require("../utils/utils");
const { web3, contract, mockERC20Contract, mockERC721Contract, BN, getERC20Decimals } = require("../config/config");
const { CONTRACT_ADDRESS, ERC20, ERC721 } = require("../contracts/contracts");
const { ethers, keccak256 } = require("ethers");
const { storeListing, getAllListings } = require("../redis/redis")
const listings = [];

const NftService = {
  getListings: async () => {
    try {
        const arr = await getAllListings();
        console.log(arr, " TESTING REDDIS ");
        return listings;
    } catch (err) {
        console.error("Failed to retrieve listings:", err);
        return [];  // or some other fallback value
    }
  },
  createListing: async ({ sellerAddress, collectionAddress, isAuction, price, tokenId, erc20Address }) => {
    const newListing = { id: listings.length + 1, sellerAddress, isAuction, price, tokenId, erc20Address, collectionAddress, };
    listings.push(newListing);
    await storeListing(newListing)
    return newListing;
  },
  placeBid: async function ({ buyerAddress, tokenId, bidAmount }) {
    const listingIndex = listings.findIndex((listing) => listing.tokenId === tokenId);
    if (listingIndex === -1) throw new Error("Listing not found");
    const updatedListing = this.processBid(listings[listingIndex], bidAmount, buyerAddress); 
    listings[listingIndex] = updatedListing;
    await storeListing(updatedListing)
    return updatedListing;
  },
  processBid: function (listing, bidAmount, buyerAddress) {
    bidAmount = parseInt(bidAmount);
    if (listing.isAuction === "true") {
      if (bidAmount >= parseInt(listing.price)) {
        return { ...listing, price: bidAmount.toString(), buyerAddress: buyerAddress }; // The new bid is valid and higher than the current price.
      } else {
        throw new Error("Bid amount too low for auction");
      }
    } else {
      if (bidAmount === parseInt(listing.price)) {
        return { ...listing, buyerAddress: buyerAddress, status: "sold" };// The NFT is purchased at the listed fixed price.
      } else {
        throw new Error("Invalid amount for fixed price purchase");
      }
    }
  },
  mintTokens: async ({ fromAddress, privateKey, toAddress, amount, token }) =>{
    try {
      const test = await mintTokens(web3, fromAddress, privateKey, toAddress, amount, token );
      return test;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },
  sign: async ({ dataString, privateKey }) => {
    if (!dataString || !privateKey) {
      throw new Error("Data or private key missing");
    }
    const signature = await sign(web3, dataString, privateKey);
    return signature;
  },
  computeDataString: function (offerSignedMessage, messageHash){
    return offerSignedMessage ? keccak256(offerSignedMessage) : keccak256(messageHash);
  },
  prepareData: async function (auctionData) {
    const { collectionAddress, erc20Address, tokenId, bid, privateKey, offerSignedMessage, } = auctionData;
    const erc20Decimals = await getERC20Decimals();
    const messageHash = ethers.solidityPacked(["address", "address", "uint256", "uint256"], [collectionAddress, erc20Address, tokenId, ethers.parseUnits(bid, parseInt(erc20Decimals))]);
    const dataString = this.computeDataString(offerSignedMessage, messageHash);
    return { dataString, privateKey };;
  },
  getBalance: async function (address) {
    const tokenContract = mockERC20Contract;
    const balance = await tokenContract.methods.balanceOf(address).call();
    console.log(`Current balance of ${address}: ${balance}`);
  },
  finishAuction: async function ( senderAccount, listing, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB, obj ) {
    const nonceA = await web3.eth.getTransactionCount(senderAccount);
    const nonceB = await web3.eth.getTransactionCount(bidderAddress);
    try {
      const erc20Decimals = await getERC20Decimals();
      console.log("111111111111111111111111111")
      const transformedBid = ethers.parseUnits(obj.bid, parseInt(erc20Decimals));
      const transformedTokenId = obj.tokenId;
      const currentGasPrice = await web3.eth.getGasPrice();
      const currentGasPriceBN = new BN(currentGasPrice);
      const adjustedGasPriceBN = currentGasPriceBN.mul(new BN(110)).div(new BN(100));  // increases the gas price by 10%
      const maxGas = 500000;
      console.log("222222222222222222222222222")
      // Estimate Gas for each tx
      const [ gasEstimateERC721, gasEstimateERC20 ] = await Promise.all([ estimateGas( mockERC721Contract, "approve", [CONTRACT_ADDRESS, transformedTokenId], senderAccount), estimateGas( mockERC20Contract, "approve", [CONTRACT_ADDRESS, transformedBid], bidderAddress)]);
      // For ERC20 and ERC721 approve
      const approveABIERC20 = generateApprovalABI(mockERC20Contract, "approve", [CONTRACT_ADDRESS, transformedBid]);
      const approveABIERC721 = generateApprovalABI(mockERC721Contract, "approve", [CONTRACT_ADDRESS, transformedTokenId]);
      console.log("3333333333333333333333333333333")
      // Check for users balance before attempting to perform a tx
      await checkBalances(web3, senderAccount, 'seller', ERC20, transformedBid, gasEstimateERC721, adjustedGasPriceBN);
      await checkBalances(web3, bidderAddress, 'bidder', ERC20, transformedBid, gasEstimateERC20, adjustedGasPriceBN);
      console.log("444444444444444444444444444444")
      const tx1 = createTxObject({ web3: web3, nonce: nonceA, from: senderAccount, to: ERC721, data: approveABIERC721, gasEstimate: gasEstimateERC721, gasPrice: adjustedGasPriceBN, maxGasLimit: maxGas });
      const tx2 = createTxObject({ web3: web3, nonce: nonceB, from: bidderAddress, to: ERC20, data: approveABIERC20, gasEstimate: gasEstimateERC20, gasPrice: adjustedGasPriceBN, maxGasLimit: maxGas });
      const [signedTx1, signedTx2] = await Promise.all([ signTx(web3, tx1, privateKeyA), signTx(web3, tx2, privateKeyB)]);
      console.log("55555555555555555555555555555555555")
      // Sending the ERC721 and ERC20 approval transactions concurrently
      const [tx1Receipt, tx2Receipt] = await Promise.all([ sendTxAndGetHash(web3, signedTx1), sendTxAndGetHash(web3, signedTx2) ]);
      console.log("66666666666666666666666666666666")
      // Buyer wants NFT
      const marketPlaceAction = generateApprovalABI( contract, "finishAuction",  [ [ obj.collectionAddress, obj.erc20Address, transformedTokenId, transformedBid, ], bidderSig, ownerApprovedSig ]);
      console.log("77777777777777777777777777777777777")
      // New nonce needed from sender because of the transaction above
      const nonceD = await web3.eth.getTransactionCount(senderAccount, "pending");
      console.log("//////////////////////////////")
      const currentGasPrice2 = await web3.eth.getGasPrice();
      const currentGasPriceBN2 = new BN(currentGasPrice2);
      console.log("******************************")
      const adjustedGasPriceBN2 = currentGasPriceBN2.mul(new BN(120)).div(new BN(100));  // increases the gas price by 20%
      const gasEstimateMarketplace = await estimateGas(contract, "finishAuction",  [[ obj.collectionAddress, obj.erc20Address, transformedTokenId, transformedBid ], bidderSig, ownerApprovedSig ], senderAccount)
      console.log("8888888888888888888888888888")
      const tx3 = createTxObject({ web3: web3, nonce: nonceD, from: senderAccount, to: CONTRACT_ADDRESS, data: marketPlaceAction, gasEstimate: gasEstimateMarketplace, gasPrice: adjustedGasPriceBN2, maxGasLimit: maxGas });
      const signedTx3 = await signTx(web3, tx3, privateKeyA);
      const tx3Receipt = await sendTxAndGetHash(web3, signedTx3)
      console.log(`NFT Marketplace ${CONTRACT_ADDRESS} executed finishAuction() successfully`)
      console.log(`Auction finished between Owner: ${senderAccount} & Buyer: ${bidderAddress}`)
      return { tx1: tx1Receipt, tx2: tx2Receipt, tx3: tx3Receipt };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },
};

module.exports = NftService;
