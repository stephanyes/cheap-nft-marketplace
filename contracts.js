const CONTRACT_ADDRESS = "0x597C9bC3F00a4Df00F85E9334628f6cDf03A1184";
const ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "collectionAddress",
            type: "address",
          },
          { internalType: "address", name: "erc20Address", type: "address" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "uint256", name: "bid", type: "uint256" },
        ],
        internalType: "struct Marketplace.AuctionData",
        name: "auctionData",
        type: "tuple",
      },
      { internalType: "bytes", name: "bidderSig", type: "bytes" },
      { internalType: "bytes", name: "ownerApprovedSig", type: "bytes" },
    ],
    name: "finishAuction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

module.exports = {
  CONTRACT_ADDRESS,
  ABI,
};
