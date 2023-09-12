/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable import/no-extraneous-dependencies */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('MockERC20', () => {
  let MockERC20; let mockERC20; let owner; let addr1; let addr2;
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  beforeEach(async () => {
    MockERC20 = await ethers.getContractFactory('MockERC20');
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    mockERC20 = await MockERC20.deploy('MockToken', 'MTK');
    // await mockERC20.deployed();
  });

  describe('Deployment', () => {
    it('Should set the right token name and symbol', async () => {
      expect(await mockERC20.name()).to.equal('MockToken');
      expect(await mockERC20.symbol()).to.equal('MTK');
    });

    it('Owner should have zero tokens initially', async () => {
      expect(await mockERC20.balanceOf(owner.address)).to.equal(0);
    });
  });

  describe('Minting', () => {
    it('Should mint the specified amount of tokens to the destination account', async () => {
      await mockERC20.mint(addr1.address, 100);
      expect(await mockERC20.balanceOf(addr1.address)).to.equal(100);
    });

    it('It should emit a Transfer event when minted', async () => {
      await expect(mockERC20.mint(addr1.address, 100)).to.emit(mockERC20, 'Transfer').withArgs(ZERO_ADDRESS, addr1.address, 100);
    });
  });
});
