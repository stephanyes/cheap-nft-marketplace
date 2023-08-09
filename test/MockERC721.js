const { expect } = require("chai");

describe("MockERC721", function () {
  let MockERC721, mockERC721, owner, addr1;
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  beforeEach(async function () {
    MockERC721 = await ethers.getContractFactory("MockERC721");
    mockERC721 = await MockERC721.deploy("TestToken", "TST");
    [owner, addr1] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should set the right token name and symbol", async function () {
      expect(await mockERC721.name()).to.equal("TestToken");
      expect(await mockERC721.symbol()).to.equal("TST");
    });

    it("Should initialize with zero supply", async function () {
      expect(await mockERC721.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a token to the specified account", async function () {
      await mockERC721.mint(addr1.address);
      expect(await mockERC721.ownerOf(0)).to.equal(addr1.address);
    });

    it("Should increase the total supply upon minting", async function () {
      await mockERC721.mint(addr1.address);
      expect(await mockERC721.totalSupply()).to.equal(1);
    });

    it("It should emit a Transfer event when minted", async function () {
      await expect(mockERC721.mint(addr1.address))
        .to.emit(mockERC721, "Transfer")
        .withArgs(ZERO_ADDRESS, addr1.address, 0);
    });
  });
});
