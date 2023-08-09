const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MockERC20", function () {
  let MockERC20, mockERC20, owner, addr1, addr2;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  beforeEach(async function () {
    MockERC20 = await ethers.getContractFactory("MockERC20");
    [owner, addr1, addr2, _] = await ethers.getSigners();

    // Deploy the contract
    mockERC20 = await MockERC20.deploy("MockToken", "MTK");
    // No need for the next line, you can remove it
    // await mockERC20.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right token name and symbol", async function () {
      expect(await mockERC20.name()).to.equal("MockToken");
      expect(await mockERC20.symbol()).to.equal("MTK");
    });

    it("Owner should have zero tokens initially", async function () {
      expect(await mockERC20.balanceOf(owner.address)).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint the specified amount of tokens to the destination account", async function () {
      await mockERC20.mint(addr1.address, 100);
      expect(await mockERC20.balanceOf(addr1.address)).to.equal(100);
    });

    it("It should emit a Transfer event when minted", async function () {
      await expect(mockERC20.mint(addr1.address, 100))
        .to.emit(mockERC20, "Transfer")
        .withArgs(ZERO_ADDRESS, addr1.address, 100);
    });
  });

  // You can continue adding more tests for any other functionality you'd like to test.
});
