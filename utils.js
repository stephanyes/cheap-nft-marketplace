const rateLimit = require("express-rate-limit");
const {
  ABI,
  CONTRACT_ADDRESS,
  ERC20_ABI,
  ERC721_ABI,
  ERC20,
  ERC721,
} = require("./contracts");

// Ethereum addresses
let accounts = null;

function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    next();
  };
}

function limitPayloadSize(req, res, next) {
  const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
  if (
    req.headers["content-length"] &&
    parseInt(req.headers["content-length"]) > MAX_PAYLOAD_SIZE
  ) {
    return res.status(413).json({ error: "Payload size exceeds the limit" });
  }
  next();
}

const limit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, // Limit to 100 req
  standardHeaders: true, // return RateLimit in headers
  legacyHeaders: false, // Disable X-RateLimit headers
});

const createAccounts = async (web3Instance, total) => {
  const accounts = [];
  for (let i = 0; i < total; i++) {
    const account = await web3Instance.eth.accounts.create();
    accounts.push(account);
  }
  return accounts;
};

async function fetchAndSetAccounts(web3Instance, total) {
  try {
    accounts = await createAccounts(web3Instance, total);
  } catch (error) {
    console.error("Error creating accounts:", error);
  }
}

function getAccounts() {
  return accounts;
}

async function getAccountBalance(web3Instance, address) {
  try {
    const balanceWei = await web3Instance.eth.getBalance(address);
    const balanceEther = await web3Instance.utils.fromWei(balanceWei, "ether");
    console.log(`The balance of ${address} in ETH is: ${balanceEther}`);
  } catch (error) {
    console.error(`An error occurred while fetching the balance: ${error}`);
  }
}

async function transferAllFunds(web3Instance, userAPrivateKey, userBAddress) {
  // Derive the address of User A from the private key
  const userA = web3Instance.eth.accounts.privateKeyToAccount(userAPrivateKey);
  web3Instance.eth.accounts.wallet.add(userA);

  // Fetch the current balance of User A
  const balance = await web3Instance.eth.getBalance(userA.address);

  // When sending all the funds, you need to take into account the gas fee.
  // So, first we'll estimate the gas for the transaction:
  const gasPrice = await web3Instance.eth.getGasPrice();
  const gasLimit = 21000; // standard gas limit for a simple transfer
  const gasCost = BigInt(gasPrice) * BigInt(gasLimit);

  // The amount to transfer would be balance minus gas cost
  const transferAmount = BigInt(balance) - gasCost;

  // Create and sign a transaction
  const tx = {
    from: userA.address,
    to: userBAddress,
    value: transferAmount.toString(),
    gas: gasLimit,
    gasPrice: gasPrice,
  };

  const signedTx = await web3Instance.eth.accounts.signTransaction(
    tx,
    userAPrivateKey
  );

  // Send the transaction and get the transaction hash
  const receipt = await web3Instance.eth.sendSignedTransaction(
    signedTx.rawTransaction
  );

  return receipt;
}

async function mintTokens(web3, fromAddress, privateKey, toAddress, amount) {
  // Create the contract instance
  const mockERC20Contract = new web3.eth.Contract(ERC721_ABI, ERC721);
  const signer = web3.eth.accounts.privateKeyToAccount(privateKey);
  const nonce = await web3.eth.getTransactionCount(signer.address);

  // Convert the amount to the smallest unit (wei-like, considering 18 decimals).
  const mintAmount = web3.utils.toWei(amount.toString(), "ether");
  const estimatedGas = await estimateGasForMinting(
    web3,
    fromAddress,
    toAddress,
    mintAmount
  );
  // Create a transaction object
  const tx = {
    to: ERC721,
    data: mockERC20Contract.methods.mint(toAddress, mintAmount).encodeABI(),
    gas: estimatedGas, // You might want to estimate this dynamically
    nonce: nonce,
    maxPriorityFeePerGas: web3.utils.toWei("2", "gwei"), // Adjust this value based on current network conditions
    maxFeePerGas: web3.utils.toWei("100", "gwei"), // Adjust this value based on current network conditions
  };

  // Sign the transaction
  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

  // Send the transaction and get the receipt
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return receipt;
}

async function estimateGasForMinting(web3, fromAddress, toAddress, amount) {
  // Create the contract instance
  const mockERC20Contract = new web3.eth.Contract(ERC721_ABI, ERC721);

  const gasEstimate = await mockERC20Contract.methods
    .mint(toAddress, amount)
    .estimateGas({
      from: fromAddress, // This is the address you're sending from. It's required for the estimation.
    });

  return gasEstimate;
}

async function getTokenBalance(
  web3Instance,
  address,
  contractAddress,
  contractABI,
  token
) {
  try {
    // Create the contract instance
    const tokenContract = new web3Instance.eth.Contract(
      contractABI,
      contractAddress
    );

    // Call the balanceOf method from the token contract
    const balanceTokenUnits = await tokenContract.methods
      .balanceOf(address)
      .call();

    let balanceTokens;
    // If ERC20, handle decimals. Otherwise, for ERC721, it's already a whole number.
    if (token === "MockERC20") {
      balanceTokens = web3Instance.utils.fromWei(balanceTokenUnits, "ether");
    } else {
      balanceTokens = balanceTokenUnits; // This is already a whole number for ERC721.
    }

    console.log(`The balance of ${address} in ${token} is: ${balanceTokens}`);
  } catch (error) {
    console.error(
      `An error occurred while fetching the token balance: ${error}`
    );
  }
}

module.exports = {
  validateBody,
  limitPayloadSize,
  limit,
  createAccounts,
  fetchAndSetAccounts,
  getAccounts,
  mintTokens,
  transferAllFunds,
  getTokenBalance,
  getAccountBalance,
};
