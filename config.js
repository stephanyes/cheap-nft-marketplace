const Web3 = require("web3").default;
const { mintTokens } = require('./utils')
const { ABI, CONTRACT_ADDRESS, ERC20_ABI, ERC721_ABI, ERC20, ERC721 } = require("./contracts");

const web3 = new Web3(process.env.INFURA_PROJECT_ID);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

async function getAccountBalance(address) {
  try {
    const balanceWei = await web3.eth.getBalance(address);
    const balanceEther = web3.utils.fromWei(balanceWei, "ether");
    console.log(`The balance of ${address} is: ${balanceEther} ETH`);
  } catch (error) {
    console.error(`An error occurred while fetching the balance: ${error}`);
  }
}


// Replace with the actual address
const address = process.env.USER_A;
const address_pk = process.env.USER_A_PK;
const address2 = process.env.USER_B;

console.log("User A: ", address);
console.log("User B: ", address2);

getAccountBalance(address);
getAccountBalance(address2);
mintTokens(web3, ERC20_ABI, ERC20, address, address_pk, address, 50)
  .then(receipt => console.log('Transaction Receipt:', receipt))
  .catch(error => console.error('Transaction Error:', error));
getAccountBalance(address);
module.exports = { web3, contract };
