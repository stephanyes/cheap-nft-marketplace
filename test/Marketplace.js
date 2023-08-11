const { expect } = require("chai");
const { AbiCoder } = require("ethers");
// const { ethers } = require("hardhat");
describe("Marketplace", function () {
  let MarketplaceFactory,
    MockERC20Factory,
    MockERC721Factory,
    marketplace,
    mockERC20,
    mockERC721,
    seller,
    buyer,
    signer,
    decimals;

  const approveAmount = "1000";
  beforeEach(async function () {
    [seller, buyer, signer] = await hre.ethers.getSigners();
    // Deploying the MockERC20 contract
    MockERC20Factory = await hre.ethers.deployContract("MockERC20", [
      "ERC20",
      "M20",
    ]);
    mockERC20 = await MockERC20Factory.waitForDeployment();

    // Deploying the MockERC721 contract
    MockERC721Factory = await hre.ethers.deployContract("MockERC721", [
      "ERC721",
      "M721",
    ]);
    mockERC721 = await MockERC721Factory.waitForDeployment();

    // Deploying the Marketplace contract
    MarketplaceFactory = await hre.ethers.deployContract("Marketplace");
    marketplace = await MarketplaceFactory.waitForDeployment();

    decimals = await mockERC20.decimals();
    console.log("MockERC20 Address: ", mockERC20.target);
    console.log("MockERC721 Address: ", mockERC721.target);
    console.log("Marketplace Address: ", marketplace.target);
    console.log("Decimals: ", decimals);

    console.log("seller Address: ", seller.address);
    console.log("buyer Address: ", buyer.address);
    console.log("signer Address: ", signer.address);
  });

  describe("finishAuction", function () {
    it("Should successfully mint an NFT", async function () {
      // Mint tokens to complete the transaction of the auction
      await mockERC20.mint(
        seller.address,
        hre.ethers.parseUnits(approveAmount, decimals)
      );
      await mockERC20.mint(
        buyer.address,
        hre.ethers.parseUnits(approveAmount, decimals)
      );

      expect(await mockERC20.balanceOf(seller.address)).to.equal(
        hre.ethers.parseUnits(approveAmount, decimals)
      );
      expect(await mockERC20.balanceOf(buyer.address)).to.equal(
        hre.ethers.parseUnits(approveAmount, decimals)
      );
      // console.log(mintNFT, "MINTED? ??/");

      // Seller is going to mint an NFT
      await mockERC721.mint(seller.address);
      expect(await mockERC721.ownerOf(0)).to.equal(seller.address);
      // Seller is allowing marketplace to exchange his NFT with id = 0
      await mockERC721.approve(marketplace.target, 0);
      expect(await mockERC721.getApproved(0)).to.equal(marketplace.target);

      // Allow Marketplace to spend for the buyer
      // First we connect buyer to the instance of mockERC20
      const buyerApproval = mockERC20.connect(buyer);
      await buyerApproval.approve(
        marketplace.target,
        hre.ethers.parseUnits(approveAmount, decimals)
      );
      expect(
        await buyerApproval.allowance(buyer.address, marketplace.target)
      ).to.equal(hre.ethers.parseUnits(approveAmount, decimals));

      const firstAllowance = await mockERC20.allowance(
        buyer.address,
        marketplace.target
      );

      const auctionData = [
        mockERC721.target,
        mockERC20.target,
        0,
        hre.ethers.parseUnits(approveAmount, decimals),
        // approveAmount,
      ];
      const coder = hre.ethers.AbiCoder.defaultAbiCoder();
      // Generating signatures
      // const messageHash = coder.encode(
      //   ["address", "address", "uint256", "uint256"],
      //   [auctionData[0], auctionData[1], auctionData[2], auctionData[3]]
      // );

      const messageHash = hre.ethers.solidityPacked(
        ["address", "address", "uint256", "uint256"],
        [auctionData[0], auctionData[1], auctionData[2], auctionData[3]]
      );
      console.log("messageHash, ", messageHash);
      const bidderSig = await buyer.signMessage(
        hre.ethers.utils.arrayify(messageHash)
      );
      const hashedBidderSig = hre.ethers.solidityKeccak256(bidderSig);
      const ownerApprovedSig = await seller.signMessage(
        hre.ethers.utils.arrayify(hashedBidderSig)
      );

      const newTest = hre.ethers.verifyMessage(messageHash, bidderSig);
      console.log("NEW TEST", newTest);

      const newTest2 = hre.ethers.verifyMessage(
        hashedBidderSig,
        ownerApprovedSig
      );
      console.log("NEW TEST 2", newTest2);

      // const test3 = coder.decode(
      //   ["address", "address", "uint256", "uint256"],
      //   messageHash
      // );
      // console.log("TEST 3 ", test3);
      // Completing the auction
      // const buyerCallingMarketplace = marketplace.connect(buyer);
      // console.log(auctionData, "auctionData");
      const caca = marketplace.connect(buyer);
      const testingggg = await caca.returnStuff(
        [auctionData[0], auctionData[1], auctionData[2], auctionData[3]],
        bidderSig,
        ownerApprovedSig
      );

      console.log(testingggg, "testingggg");
      // Assertions
      // expect(await mockERC20.balanceOf(buyer.address)).to.equal(
      //   hre.ethers.parseUnits(9000, decimals)
      // );
      expect(await mockERC721.ownerOf(0)).to.equal(buyer.address);
    });
  });
});
// const actualAllowance = await buyerApproval.allowance(
//   buyer.address,
//   marketplace.target
// );
// console.log("Actual Allowance:", actualAllowance.toString());

// await buyerApproval.increaseAllowance(
//   marketplace.target,
//   hre.ethers.parseUnits(approveAmount, decimals)
// );

// const newAllowance = await buyerApproval.allowance(
//   buyer.address,
//   marketplace.target
// );
// console.log("new Allowance:", newAllowance.toString());
