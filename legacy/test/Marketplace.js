/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable no-undef */
const { expect } = require('chai');
const { keccak256 } = require('ethers');
const { Utils } = require('alchemy-sdk');

describe('Marketplace', () => {
  // eslint-disable-next-line no-unused-vars
  let MarketplaceFactory; let MockERC20Factory; let MockERC721Factory; let marketplace; let mockERC20; let mockERC721; let seller; let buyer; let signer; let
    decimals;
  const approveAmount = '1000';
  const mintERC20 = '10000';
  beforeEach(async () => {
    [seller, buyer, signer] = await hre.ethers.getSigners();
    // Deploying the MockERC20 contract
    MockERC20Factory = await hre.ethers.deployContract('MockERC20', ['ERC20', 'M20']);
    mockERC20 = await MockERC20Factory.waitForDeployment();
    // Deploying the MockERC721 contract
    MockERC721Factory = await hre.ethers.deployContract('MockERC721', ['ERC721', 'M721']);
    mockERC721 = await MockERC721Factory.waitForDeployment();
    // Deploying the Marketplace contract
    MarketplaceFactory = await hre.ethers.deployContract('Marketplace');
    marketplace = await MarketplaceFactory.waitForDeployment();
    decimals = await mockERC20.decimals();
  });

  describe('finishAuction', () => {
    it('Should successfully execute finishAuction()', async () => {
      // Mint tokens to complete the transaction of the auction
      await mockERC20.mint(seller.address, hre.ethers.parseUnits(mintERC20, decimals));
      await mockERC20.mint(buyer.address, hre.ethers.parseUnits(mintERC20, decimals));

      expect(await mockERC20.balanceOf(seller.address)).to.equal(hre.ethers.parseUnits(mintERC20, decimals));
      expect(await mockERC20.balanceOf(buyer.address)).to.equal(hre.ethers.parseUnits(mintERC20, decimals));
      // Seller is going to mint an NFT
      await mockERC721.mint(seller.address);
      expect(await mockERC721.ownerOf(0)).to.equal(seller.address);
      // Seller is allowing marketplace to exchange his NFT with id = 0
      await mockERC721.approve(marketplace.target, 0);
      expect(await mockERC721.getApproved(0)).to.equal(marketplace.target);

      // Allow Marketplace to spend for the buyer
      // First we connect buyer to the instance of mockERC20
      const buyerApproval = mockERC20.connect(buyer);
      await buyerApproval.approve(marketplace.target, hre.ethers.parseUnits(approveAmount, decimals));
      expect(await buyerApproval.allowance(buyer.address, marketplace.target)).to.equal(hre.ethers.parseUnits(approveAmount, decimals));

      // const firstAllowance = await mockERC20.allowance(buyer.address, marketplace.target);
      const auctionData = [mockERC721.target, mockERC20.target, 0, hre.ethers.parseUnits(approveAmount, decimals)];

      // Generating signatures
      const messageHash = ethers.solidityPacked(['address', 'address', 'uint256', 'uint256'], [auctionData[0], auctionData[1], auctionData[2], auctionData[3]]);
      const keccack = keccak256(messageHash);
      const bidderSig = await buyer.signMessage(Utils.arrayify(keccack)); // ASDLKUYASDJKGASDJKASGHDJKGSD this line was the one that unblocked everything. Utils.arrayify was needed
      const hashedBidderSig = keccak256(bidderSig);
      const ownerApprovedSig = await seller.signMessage(Utils.arrayify(hashedBidderSig));
      await marketplace.finishAuction([auctionData[0], auctionData[1], auctionData[2], auctionData[3]], bidderSig, ownerApprovedSig);
      // Assertions
      const calculation = mintERC20 - approveAmount;
      expect(await mockERC20.balanceOf(buyer.address)).to.equal(hre.ethers.parseUnits(calculation.toString(), decimals));
      expect(await mockERC721.ownerOf(0)).to.equal(buyer.address);
    });
  });
});
