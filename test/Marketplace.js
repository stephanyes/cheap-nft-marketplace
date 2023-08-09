const { expect } = require("chai");
const { AbiCoder } = require("ethers");
const { ethers } = require("hardhat");
describe("Marketplace", function () {
  let Marketplace,
    marketplace,
    MockERC20,
    mockERC20,
    MockERC721,
    mockERC721,
    owner,
    bidder,
    signer;

  beforeEach(async function () {
    // Get the signer accounts
    [owner, bidder, signer] = await ethers.getSigners();

    // Deploying the MockERC20 contract
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20Factory.deploy("MockToken", "MCK");
    await mockERC20.deployed();
    console.log("MockERC20 Address:", mockERC20.address);

    // Deploying the MockERC721 contract
    const MockERC721Factory = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721Factory.deploy("MockNFT", "MNFT");
    await mockERC721.deployed();
    console.log("MockERC721 Address:", mockERC721.address);

    // Deploying the Marketplace contract
    const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
    marketplace = await MarketplaceFactory.deploy();
    await marketplace.deployed();
    console.log("Marketplace Address:", marketplace.address);
  });

  describe("finishAuction", function () {
    it("Should successfully complete the auction", async function () {
      // The auction data
      console.log("ERC721 Address:", MockERC721.address);
      console.log("ERC20 Address:", MockERC20.address);

      const auctionData = {
        collectionAddress: mockERC721.address,
        erc20Address: mockERC20.address,
        tokenId: 0,
        bid: 100,
      };

      //   console.log(auctionData);
      console.log("collectionAddress:", auctionData.collectionAddress);
      console.log("erc20Address:", auctionData.erc20Address);
      console.log("tokenId:", auctionData.tokenId);
      console.log("bid:", auctionData.bid);

      const coder = ethers.AbiCoder.defaultAbiCoder();
      // Generating signatures
      const messageHash = ethers.keccak256(
        coder.encode(
          ["address", "address", "uint256", "uint256"],
          [
            auctionData.collectionAddress,
            auctionData.erc20Address,
            auctionData.tokenId,
            auctionData.bid,
          ]
        )
      );

      const bidderSig = await bidder.signMessage(ethers.getBytes(messageHash));
      const hashedBidderSig = ethers.utils.keccak256(bidderSig);
      const ownerApprovedSig = await signer.signMessage(
        ethers.getBytes(hashedBidderSig)
      );

      // Approving the necessary transfers
      await mockERC20.connect(bidder).approve(marketplace.address, 100);
      await mockERC721.connect(owner).approve(marketplace.address, 0);

      // Completing the auction
      await marketplace.finishAuction(auctionData, bidderSig, ownerApprovedSig);

      // Assertions
      expect(await mockERC20.balanceOf(bidder.address)).to.equal(900);
      expect(await mockERC721.ownerOf(0)).to.equal(bidder.address);
    });
  });
});
