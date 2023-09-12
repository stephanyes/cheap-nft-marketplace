/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable no-undef */
import { expect } from 'chai';
import { keccak256 } from 'ethers';
import { Utils } from 'alchemy-sdk';
import { ethers } from 'hardhat';

describe('Marketplace', () => {
  let MarketplaceFactory;
  let MockERC20Factory;
  let MockERC721Factory;
  let marketplace: any;
  let mockERC20: any;
  let mockERC721: any;
  let seller: any;
  let buyer: any;
  let signer: any;
  let decimals: any;
  const approveAmount: number = 1000;
  const mintERC20: number = 10000;
  beforeEach(async () => {
    [seller, buyer, signer] = await ethers.getSigners();
    // Deploying the MockERC20 contract
    MockERC20Factory = await ethers.deployContract('MockERC20', ['ERC20', 'M20']);
    mockERC20 = await MockERC20Factory.waitForDeployment();
    // Deploying the MockERC721 contract
    MockERC721Factory = await ethers.deployContract('MockERC721', ['ERC721', 'M721']);
    mockERC721 = await MockERC721Factory.waitForDeployment();
    // Deploying the Marketplace contract
    MarketplaceFactory = await ethers.deployContract('Marketplace');
    marketplace = await MarketplaceFactory.waitForDeployment();
    decimals = await mockERC20.decimals();
  });

  describe('finishAuction', () => {
    it('Should successfully execute finishAuction()', async () => {
      // Mint tokens to complete the transaction of the auction
      await mockERC20.mint(seller.address, ethers.parseUnits(mintERC20.toString(), decimals));
      await mockERC20.mint(buyer.address, ethers.parseUnits(mintERC20.toString(), decimals));

      expect(await mockERC20.balanceOf(seller.address)).to.equal(ethers.parseUnits(mintERC20.toString(), decimals));
      expect(await mockERC20.balanceOf(buyer.address)).to.equal(ethers.parseUnits(mintERC20.toString(), decimals));
      // Seller is going to mint an NFT
      await mockERC721.mint(seller.address);
      expect(await mockERC721.ownerOf(0)).to.equal(seller.address);
      // Seller is allowing marketplace to exchange his NFT with id = 0
      await mockERC721.approve(marketplace.target, 0);
      expect(await mockERC721.getApproved(0)).to.equal(marketplace.target);

      // Allow Marketplace to spend for the buyer
      // First we connect buyer to the instance of mockERC20
      const buyerApproval = mockERC20.connect(buyer);
      await buyerApproval.approve(marketplace.target, ethers.parseUnits(approveAmount.toString(), decimals));
      expect(await buyerApproval.allowance(buyer.address, marketplace.target)).to.equal(ethers.parseUnits(approveAmount.toString(), decimals));

      // const firstAllowance = await mockERC20.allowance(buyer.address, marketplace.target);
      const auctionData = [mockERC721.target, mockERC20.target, 0, ethers.parseUnits(approveAmount.toString(), decimals)];

      // Generating signatures
      const messageHash = ethers.solidityPacked(['address', 'address', 'uint256', 'uint256'], [auctionData[0], auctionData[1], auctionData[2], auctionData[3]]);
      const keccack = keccak256(messageHash);
      const bidderSig = await buyer.signMessage(Utils.arrayify(keccack)); // ASDLKUYASDJKGASDJKASGHDJKGSD this line was the one that unblocked everything. Utils.arrayify was needed
      const hashedBidderSig = keccak256(bidderSig);
      const ownerApprovedSig = await seller.signMessage(Utils.arrayify(hashedBidderSig));
      await marketplace.finishAuction([auctionData[0], auctionData[1], auctionData[2], auctionData[3]], bidderSig, ownerApprovedSig);
      // Assertions
      const calculation = mintERC20 - approveAmount;
      expect(await mockERC20.balanceOf(buyer.address)).to.equal(ethers.parseUnits(calculation.toString(), decimals));
      expect(await mockERC721.ownerOf(0)).to.equal(buyer.address);
    });
  });
});
