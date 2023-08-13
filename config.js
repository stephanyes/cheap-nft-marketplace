const Web3 = require("web3");
const {
  mintTokens,
  transferAllFunds,
  getTokenBalance,
  getAccountBalance,
} = require("./utils");
const {
  ABI,
  CONTRACT_ADDRESS,
  ERC20_ABI,
  ERC721_ABI,
  ERC20,
  ERC721,
} = require("./contracts");

const web3 = new Web3(process.env.INFURA_PROJECT_ID);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

const address = process.env.USER_A;
const address2 = process.env.USER_B;
const address_pk = process.env.USER_A_PK;
const address2_pk = process.env.USER_B_PK;

getAccountBalance(web3, address);
getAccountBalance(web3, address2);

getTokenBalance(web3, address, ERC20, ERC20_ABI, "MockERC20");
getTokenBalance(web3, address2, ERC20, ERC20_ABI, "MockERC20");

getTokenBalance(web3, address, ERC721, ERC721_ABI, "MockERC721");
getTokenBalance(web3, address2, ERC721, ERC721_ABI, "MockERC721");

// mintTokens(web3, address2, address2_pk, address2, 1)
//   .then((receipt) => {
//     console.log("Transaction receipt: ", receipt);
//   })
//   .catch((error) => {
//     console.error("Error transferring funds: ", error);
//   });

module.exports = { web3, contract };
