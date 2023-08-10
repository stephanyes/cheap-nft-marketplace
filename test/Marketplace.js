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
    // console.log(MockERC20Factory, " MockERC20Factory")
    await mockERC20.deployed();
    // console.log("MockERC20 Address:", mockERC20.address);

    // Deploying the MockERC721 contract
    const MockERC721Factory = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721Factory.deploy("MockNFT", "MNFT");
    // await mockERC721.deploy();
    // console.log("MockERC721 Address:", mockERC721.address);

    // Deploying the Marketplace contract
    const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
    marketplace = await MarketplaceFactory.deploy();
    // await marketplace.deploy();
    // console.log("Marketplace Address:", marketplace.address);
    marketplace.address = "0x597C9bC3F00a4Df00F85E9334628f6cDf03A1184"
    mockERC20.address = "0xbd65c58D6F46d5c682Bf2f36306D461e3561C747"
    mockERC721.address = "0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3ff"
  });

  describe("finishAuction", function () {
    it("Should successfully complete the auction", async function () {
      const mintNFT = await mockERC721.mint(owner.address).wait();
      const tokenId = mintNFT.events?.find(e => e.event === 'Transfer').args.tokenId;
      console.log("Token id ??? ", tokenId)
      const mintNFT2 = await mockERC721.mint(bidder.address)
      const auctionData = {
        collectionAddress: marketplace.address,
        erc20Address: mockERC20.address,
        tokenId: 0,
        bid: 100,
      };
      console.log(mintNFT)
      console.log(owner.address, "ADDREESS")
      // console.log("mint nft ", mintNFT)
      // console.log(owner.address, "owner")
      // console.log(bidder.address, "bidder")
      // console.log(signer.address, "signer")
      // console.log("owner nft ", await mockERC721.ownerOf(0))
      // console.log("bidder nft ", await mockERC721.ownerOf(1))
      // console.log("collectionAddress:", auctionData.collectionAddress);
      // console.log("erc20Address:", auctionData.erc20Address);
      // console.log("tokenId:", auctionData.tokenId);
      // console.log("bid:", auctionData.bid);

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
      const hashedBidderSig = ethers.keccak256(bidderSig);
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
