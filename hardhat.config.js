require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/5d77802fcc8342b8b67c82df72c3f949",
      accounts: [
        "0xbe25616c4dad32e9d83798edc79c6d8f1a1443908712ab7e41d9edb16f88cdc3",
        "0x4ddd1de9aa7a32e791e63c5bf33cc1f1fbefe4f792f00dc17edbe3a2a84c89c7",
      ],
    },
  },
};
