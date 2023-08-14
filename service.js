const { getAccounts, mintTokens, signTx, sendSignedTx, estimateGas, createTxObject, generateApprovalABI } = require("./utils");
const { web3, contract, mockERC20Contract, mockERC721Contract, BN } = require("./config");
const { ABI, CONTRACT_ADDRESS, ERC20_ABI, ERC20, ERC721_ABI, ERC721 } = require("./contracts");
const { ethers, keccak256 } = require("ethers");
const BigNumber = require("bignumber.js");
const listings = [];
let transactionQueue = [];

const NftService = {
  createListing: ({ sellerAddress, collectionAddress, isAuction, price, tokenId, erc20Address }) => {
    const newListing = { id: listings.length + 1, sellerAddress, isAuction, price, tokenId, erc20Address, collectionAddress, };
    listings.push(newListing);
    return newListing;
  },

  placeBid: ({ buyerAddress, tokenId, bidAmount }) => {
    const listing = listings.find((listing) => listing.tokenId === tokenId);

    if (!listing) throw new Error("Listing not found");

    if (listing.isAuction && parseInt(bidAmount) >= parseInt(listing.price)) {
      listing.price = bidAmount;
      listing.buyerAddress = buyerAddress;
    } else if (!listing.isAuction && bidAmount === listing.price) {
      listing.buyerAddress = buyerAddress;
    } else {
      throw new Error("Invalid bid");
    }

    return listing;
  },

  mintTokens: async function ({ fromAddress, privateKey, toAddress, amount }) {
    try {
      const test = await mintTokens(web3, fromAddress, privateKey, toAddress, amount );
      return test;
    } catch (error) {
      console.error("Error:", error);
      throw error; // or return some error message to handle it gracefully
    }
  },

  getListings: () => {
    return listings;
  },

  getAccounts: () => {
    return getAccounts();
  },

  sign: ({ dataString, privateKey }) => {
    if (!dataString || !privateKey) {
      throw new Error("Data or private key missing");
    }
    const signature = web3.eth.accounts.sign(dataString, privateKey);
    return signature;
  },

  prepareData: (auctionData) => {
    const { collectionAddress, erc20Address, tokenId, bid, privateKey, offerSignedMessage, } = auctionData;
    let dataString;
    const messageHash = ethers.solidityPacked( ["address", "address", "uint256", "uint256"],[collectionAddress, erc20Address, tokenId, ethers.parseUnits(bid, 18)] );
    if (offerSignedMessage) {
      dataString = keccak256(offerSignedMessage);
    } else {
      dataString = keccak256(messageHash);
    }
    return { dataString, privateKey };
  },

  getBalance: async function (address) {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, ERC20);
    const balance = await tokenContract.methods.balanceOf(address).call();
    console.log(`Current balance of ${address}: ${balance}`);
  },

  finalizeTrade: async function ( senderAccount, listing, bidderSig, ownerApprovedSig, bidderAddress, privateKeyA, privateKeyB, obj ) {
    const nonceA = await web3.eth.getTransactionCount(senderAccount);
    const nonceB = await web3.eth.getTransactionCount(bidderAddress);
    try {
      const transformedBid = ethers.parseUnits(obj.bid, 18);
      const transformedTokenId = obj.tokenId;
      const currentGasPrice = await web3.eth.getGasPrice();
      const currentGasPriceBN = new BN(currentGasPrice);
      const adjustedGasPriceBN = currentGasPriceBN.mul(new BN(110)).div(new BN(100));  // increases the gas price by 10%
      const maxGas = 500000;
      // Estimate Gas for each tx
      const [ gasEstimateERC721, gasEstimateERC20 ] = await Promise.all([ estimateGas( mockERC721Contract, "approve", [CONTRACT_ADDRESS, transformedTokenId], senderAccount), estimateGas( mockERC20Contract, "approve", [CONTRACT_ADDRESS, transformedBid], bidderAddress)]);
      // For ERC20 and ERC721 approve
      const approveABIERC20 = generateApprovalABI(mockERC20Contract, "approve", [CONTRACT_ADDRESS, transformedBid]);
      const approveABIERC721 = generateApprovalABI(mockERC721Contract, "approve", [CONTRACT_ADDRESS, transformedTokenId]);
      const tx1 = createTxObject({ web3: web3, nonce: nonceA, from: senderAccount, to: ERC721, data: approveABIERC721, gasEstimate: gasEstimateERC721, gasPrice: adjustedGasPriceBN, maxGasLimit: maxGas });
      const tx2 = createTxObject({ web3: web3, nonce: nonceB, from: bidderAddress, to: ERC20, data: approveABIERC20, gasEstimate: gasEstimateERC20, gasPrice: adjustedGasPriceBN, maxGasLimit: maxGas });
      const [signedTx1, signedTx2] = await Promise.all([ signTx(web3, tx1, privateKeyA), signTx(web3, tx2, privateKeyB)]);
      // Sending the ERC721 and ERC20 approval transactions concurrently
      const [tx1Receipt, tx2Receipt] = await Promise.all([ sendSignedTx(web3, signedTx1), sendSignedTx(web3, signedTx2) ]);
      // Buyer wants NFT
      const marketPlaceAction = generateApprovalABI( contract, "finishAuction",  [ [ obj.collectionAddress, obj.erc20Address, transformedTokenId, transformedBid, ], bidderSig, ownerApprovedSig ]);
      // New nonce needed from sender because of the transaction above
      const nonceC = await web3.eth.getTransactionCount(senderAccount);
      const gasEstimateMarketplace = await estimateGas(contract, "finishAuction",  [[ obj.collectionAddress, obj.erc20Address, transformedTokenId, transformedBid ], bidderSig, ownerApprovedSig ], senderAccount)
      const tx3 = createTxObject({ web3: web3, nonce: nonceC, from: senderAccount, to: CONTRACT_ADDRESS,data: marketPlaceAction, gasEstimate: gasEstimateMarketplace, gasPrice: adjustedGasPriceBN, maxGasLimit: maxGas });
      const signedTx3 = await signTx(web3, tx3, privateKeyA);
      const tx3Receipt = await sendSignedTx(web3, signedTx3)

      return { tx1: tx1Receipt, tx2: tx2Receipt, tx3: tx3Receipt };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },
};

module.exports = NftService;
