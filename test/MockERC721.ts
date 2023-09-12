/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('MockERC721', () => {
  let MockERC721; let mockERC721:any; let owner:any; let addr1:any;
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  beforeEach(async () => {
    MockERC721 = await ethers.getContractFactory('MockERC721');
    mockERC721 = await MockERC721.deploy('TestToken', 'TST');
    [owner, addr1] = await ethers.getSigners();
  });

  describe('Deployment', () => {
    it('Should set the right token name and symbol', async () => {
      expect(await mockERC721.name()).to.equal('TestToken');
      expect(await mockERC721.symbol()).to.equal('TST');
    });

    it('Should initialize with zero supply', async () => {
      expect(await mockERC721.totalSupply()).to.equal(0);
    });
  });

  describe('Minting', () => {
    it('Should mint a token to the specified account', async () => {
      await mockERC721.mint(addr1.address);
      expect(await mockERC721.ownerOf(0)).to.equal(addr1.address);
    });

    it('Should increase the total supply upon minting', async () => {
      await mockERC721.mint(addr1.address);
      expect(await mockERC721.totalSupply()).to.equal(1);
    });

    it('It should emit a Transfer event when minted', async () => {
      await expect(mockERC721.mint(addr1.address)).to.emit(mockERC721, 'Transfer').withArgs(ZERO_ADDRESS, addr1.address, 0);
    });
  });
});
