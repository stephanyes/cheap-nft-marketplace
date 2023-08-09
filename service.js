const { getAccounts } = require("./utils");
const { web3 } = require("./config");
const {
  ABI,
  CONTRACT_ADDRESS,
  ERC20_ABI,
  ERC20,
  ERC721_ABI,
  ERC721,
} = require("./contracts");
const BigNumber = require("bignumber.js");
const listings = [];
let transactionQueue = [];

const NftService = {
  createListing: ({
    sellerAddress,
    collectionAddress,
    isAuction,
    price,
    tokenId,
    erc20Address,
  }) => {
    const newListing = {
      id: listings.length + 1,
      sellerAddress,
      isAuction,
      price,
      tokenId,
      erc20Address,
      collectionAddress,
    };
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

  getListings: () => {
    return listings;
  },

  getAccounts: () => {
    return getAccounts();
  },

  sign: ({ toBeSigned, privateKey, dataString }) => {
    if (!toBeSigned || !privateKey) {
      throw new Error("Data or private key missing");
    }
    const prefixedMessage = web3.eth.accounts.hashMessage(dataString);

    const signature = web3.eth.accounts.sign(prefixedMessage, privateKey);

    // Try recovery with both methods
    const recoveredAddress1 = web3.eth.accounts.recover(
      prefixedMessage,
      signature.signature
    );
    const recoveredAddress2 = web3.eth.accounts.recover(
      dataString,
      signature.signature
    ); // without prefixed

    console.log(
      "Original Address:",
      web3.eth.accounts.privateKeyToAccount(privateKey).address
    );
    console.log("Recovered Address (with prefix):", recoveredAddress1);
    console.log("Recovered Address (without prefix):", recoveredAddress2);
    return signature;
  },

  prepareData: (auctionData) => {
    const {
      collectionAddress,
      erc20Address,
      tokenId,
      bid,
      privateKey,
      offerSignedMessage,
    } = auctionData;
    // let dataString;

    // if (offerSignedMessage) {
    //   dataString = `${collectionAddress}${erc20Address}${tokenId.toString()}${bid.toString()}${offerSignedMessage}`;
    // } else {
    // }
    let dataString = `${collectionAddress}${erc20Address}${tokenId.toString()}${bid.toString()}`;
    const toBeSigned = web3.utils.keccak256(dataString);
    return { toBeSigned, privateKey, dataString };
  },

  getBalance: async function (address) {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, ERC20);
    const balance = await tokenContract.methods.balanceOf(address).call();
    console.log(`Current balance of ${address}: ${balance}`);
  },

  finalizeTrade: async function (
    senderAccount,
    listing,
    bidderSig,
    ownerApprovedSig,
    bidderAddress,
    privateKeyA,
    privateKeyB,
    obj
  ) {
    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    const mockERC20Contract = new web3.eth.Contract(ERC20_ABI, ERC20);
    const mockERC721Contract = new web3.eth.Contract(ERC721_ABI, ERC721);

    const nonceA = await web3.eth.getTransactionCount(senderAccount);
    const nonceB = await web3.eth.getTransactionCount(bidderAddress);

    try {
      const transformedBid = web3.utils.toBigInt(obj.bid);
      const transformedTokenId = web3.utils.toBigInt(obj.tokenId);
      console.log("000000000000000000000000");

      const gasPrice = await web3.eth.getGasPrice();
      // Estimate Gas for each tx
      let gasEstimateERC721 = await mockERC721Contract.methods
        .approve(CONTRACT_ADDRESS, transformedTokenId)
        .estimateGas({ from: senderAccount });

      let gasEstimateERC20 = await mockERC20Contract.methods
        .approve(CONTRACT_ADDRESS, transformedBid)
        .estimateGas({ from: bidderAddress });
      console.log("AAAAAAAAAAAAAAAAAAAAAAAA");

      // Allow NFT Marketplace to send the MockERC20 tokens from bidderAccount on its behalf
      const approveABIERC20 = mockERC20Contract.methods
        .approve(CONTRACT_ADDRESS, transformedBid)
        .encodeABI();

      console.log("111111111111111111111111111");

      // Allow NFT Marketplace to send the NFT from senderAccount on its behalf
      const approveABIERC721 = mockERC721Contract.methods
        .approve(CONTRACT_ADDRESS, transformedTokenId)
        .encodeABI();

      console.log("2222222222222222222222222");

      const tx1 = {
        nonce: web3.utils.toHex(nonceA),
        from: senderAccount,
        to: ERC721,
        data: approveABIERC721,
        gas: gasEstimateERC721,
        gasPrice,
      };

      console.log("3333333333333333333333333333");
      const tx2 = {
        nonce: web3.utils.toHex(nonceB),
        from: bidderAddress,
        to: ERC20,
        data: approveABIERC20,
        gas: gasEstimateERC20,
        gasPrice,
      };

      console.log("44444444444444444444444444");
      // Signing transactions concurrently
      const [signedTx1, signedTx2] = await Promise.all([
        web3.eth.accounts.signTransaction(tx1, privateKeyA),
        web3.eth.accounts.signTransaction(tx2, privateKeyB),
      ]);

      // Sending the ERC721 and ERC20 approval transactions concurrently
      const [tx1Receipt, tx2Receipt] = await Promise.all([
        web3.eth.sendSignedTransaction(
          signedTx1.raw || signedTx1.rawTransaction
        ),
        web3.eth.sendSignedTransaction(
          signedTx2.raw || signedTx2.rawTransaction
        ),
      ]);
      console.log("after tx1 & tx2 receipt");
      //   console.log("tx 1 receipt ", tx1Receipt);
      //   console.log("tx 2 receipt ", tx2Receipt);
      const allowance = await mockERC20Contract.methods
        .allowance(bidderAddress, CONTRACT_ADDRESS)
        .call();
      console.log(
        "Allowance set by bidderAddress for CONTRACT_ADDRESS: ",
        allowance
      );
      const allowance2 = await mockERC20Contract.methods
        .allowance(senderAccount, CONTRACT_ADDRESS)
        .call();
      console.log("Allowance set by sender for CONTRACT_ADDRESS: ", allowance2);
      console.log("Transformed Bid:", transformedBid);
      // Buyer wants NFT
      const marketPlaceAction = contract.methods
        .finishAuction(
          [
            obj.collectionAddress,
            obj.erc20Address,
            transformedTokenId,
            transformedBid,
          ],
          bidderSig,
          ownerApprovedSig
        )
        .encodeABI();
      console.log("marketPlaceAction ", marketPlaceAction);
      let gasEstimateMarketplace = await contract.methods
        .finishAuction(
          [
            obj.collectionAddress,
            obj.erc20Address,
            transformedTokenId,
            transformedBid,
          ],
          bidderSig,
          ownerApprovedSig
        )
        .estimateGas({ from: bidderAddress });
      console.log("gasEstimate Marketplace ", gasEstimateMarketplace);
      const tx3 = {
        nonce: web3.utils.toHex(nonceB),
        gas: gasEstimateMarketplace,
        gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
        to: CONTRACT_ADDRESS,
        data: marketPlaceAction,
      };
      console.log("tx3 ", tx3);
      const signedTx3 = await web3.eth.accounts.signTransaction(
        tx3,
        privateKeyB
      );
      const tx3Receipt = await web3.eth.sendSignedTransaction(
        signedTx3.raw || signedTx3.rawTransaction
      );

      console.log("tx 3 receipt ", tx3Receipt);

      return tx3Receipt;
    } catch (error) {
      console.error("Error:", error);
      throw error; // or return some error message to handle it gracefully
    }
  },
};

module.exports = NftService;

// finalizeTrade: async function (
//     senderAccount,
//     listing,
//     bidderSig,
//     ownerApprovedSig,
//     bidderAddress,
//     privateKeyA,
//     privateKeyB,
//     obj
//   ) {
//     const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
//     const tokenContract = new web3.eth.Contract(ERC20_ABI, ERC20);

//     const nonceA = await web3.eth.getTransactionCount(senderAccount);
//     const nonceB = await web3.eth.getTransactionCount(bidderAddress);
//     // This returns how much CONTRACT_ADDRESS can spend on behalf of in this case bidderAddress
//     // const currentAllowanceBidder = await tokenContract.methods
//     //   .allowance(bidderAddress, CONTRACT_ADDRESS)
//     //   .call();
//     // console.log("Current Allowance Bider: ", currentAllowanceBidder);
//     // const currentAllowanceSender = await tokenContract.methods
//     //   .allowance(senderAccount, CONTRACT_ADDRESS)
//     //   .call();
//     // console.log("Current Allowance Sender: ", currentAllowanceSender);
//     // const transformedBid = web3.utils.toBigInt(obj.bid);
//     // const transformedTokenId = web3.utils.toBigInt(obj.tokenId);
//     try {
//       await this.getBalance(senderAccount);
//       await this.getBalance(bidderAddress);
//       //   const gasPrice = await web3.eth.getGasPrice();
//       //   let gasEstimateApprove = await tokenContract.methods
//       //     .approve(CONTRACT_ADDRESS, currentAllowanceBidder)
//       //     .estimateGas({ from: senderAccount });

//       //   const approveData = tokenContract.methods
//       //     .approve(CONTRACT_ADDRESS, currentAllowanceBidder)
//       //     .encodeABI();

//       //   const approveTx = {
//       //     nonce: nonceA,
//       //     from: senderAccount,
//       //     to: ERC20,
//       //     data: approveData,
//       //     gasPrice: gasPrice,
//       //     gas: gasEstimateApprove,
//       //   };
//       //   const signedApproveTx = await web3.eth.accounts.signTransaction(
//       //     approveTx,
//       //     privateKeyA
//       //   );
//       //   console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaaa");
//       //   await web3.eth.sendSignedTransaction(signedApproveTx.rawTransaction);
//       //   console.log("BBBBBBBBBBBBBBBBBBBBb");
//       //   let gasEstimateAuction = await contract.methods
//       //     .finishAuction(
//       //       [
//       //         obj.collectionAddress,
//       //         obj.erc20Address,
//       //         transformedTokenId,
//       //         currentAllowanceBidder,
//       //       ],
//       //       bidderSig,
//       //       ownerApprovedSig
//       //     )
//       //     .estimateGas({ from: senderAccount });
//       //   console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCcc");

//       //   const tx = {
//       //     nonce: nonceB,
//       //     from: senderAccount,
//       //     to: CONTRACT_ADDRESS,
//       //     data: contract.methods
//       //       .finishAuction(
//       //         [
//       //           obj.collectionAddress,
//       //           obj.erc20Address,
//       //           transformedTokenId,
//       //           currentAllowanceBidder,
//       //         ],
//       //         bidderSig,
//       //         ownerApprovedSig
//       //       )
//       //       .encodeABI(),
//       //     gas: gasEstimateAuction,
//       //     gasPrice,
//       //   };
//       //   console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");

//       //   const signedTx = await web3.eth.accounts.signTransaction(tx, privateKeyA);
//       //   const receipt = await web3.eth.sendSignedTransaction(
//       //     signedTx.rawTransaction
//       //   );
//       //   console.log("EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");

//       //   // const receipt = await web3.eth.sendTransaction(tx);
//       //   return receipt;
//       return "ok";
//     } catch (error) {
//       console.error("Error:", error);
//       throw error; // or return some error message to handle it gracefully
//     }
//   },
