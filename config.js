const Web3 = require("web3").default;
const { ABI, CONTRACT_ADDRESS } = require("./contracts");

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
const address2 = process.env.USER_B;
console.log("User A: ", address);
console.log("User B: ", address2);

getAccountBalance(address);
getAccountBalance(address2);

module.exports = { web3, contract };
