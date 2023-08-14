const Web3 = require("web3");
const { ABI, CONTRACT_ADDRESS, ERC20_ABI, ERC721_ABI, ERC20, ERC721 } = require("./contracts");

const web3 = new Web3(process.env.INFURA_PROJECT_ID);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
const mockERC20Contract = new web3.eth.Contract(ERC20_ABI, ERC20);
const mockERC721Contract = new web3.eth.Contract(ERC721_ABI, ERC721);;
const BN = Web3.utils.BN


module.exports = { web3, contract, mockERC20Contract, mockERC721Contract, BN };
