const rateLimit = require("express-rate-limit");
const { ABI, CONTRACT_ADDRESS, ERC20_ABI, ERC721_ABI, ERC20, ERC721 } = require("../contracts/contracts");
const { mockERC20Contract, contract, mockERC721Contract } = require("../config/config");

async function checkBalances(web3, account, type, ERC20ContractAddress, requiredTokenAmount, estimatedGas, gasPrice) {
  // Check Ether balance for gas
  let etherBalance = await web3.eth.getBalance(account);
  let requiredEther = BigInt(estimatedGas) * BigInt(gasPrice);
  if (BigInt(etherBalance) < requiredEther)
      throw new Error(`Insufficient Ether for gas for account ${account}.`);
  if(type === 'bidder') {
    // Check ERC20 balance only for bidder
    let ERC20Contract = new web3.eth.Contract(ERC20_ABI, ERC20ContractAddress);
    let tokenBalance = await ERC20Contract.methods.balanceOf(account).call();
    let symbol = await ERC20Contract.methods.symbol().call();
    if (BigInt(tokenBalance) < BigInt(requiredTokenAmount))
      throw new Error(`Insufficient ERC20 token balance for account ${account}.`);
    console.log(`${account} balance: ${etherBalance} ETH & ${tokenBalance} ${symbol} token`);
  } else {
    console.log(`${account} balance: ${etherBalance} ETH`);
  }
  return true;
}

function convertToWei(web3, amount, unit = "gwei") {
  return web3.utils.toWei(amount, unit);
}

function createTxObject({ web3, nonce, from, to, data, gasEstimate, gasPrice, maxGasLimit }) {
  const finalGasLimit = Math.min(gasEstimate, maxGasLimit);
  console.log(`Creating TxObject with finalGasLimit set to: ${finalGasLimit}`)
  return {
    nonce: web3.utils.toHex(nonce),
    from,
    to,
    data,
    gas: finalGasLimit,
    gasPrice: web3.utils.toHex(gasPrice)
  };
}

function estimateGas(contract, methodName, params, sender) {
  console.log("Estimating gas")
  return contract.methods[methodName](...params).estimateGas({ from: sender });
}

async function estimateGasForMinting(tokenContract, fromAddress, toAddress, amount) {
  // Create the contract instance
  const symbol = await tokenContract.methods.symbol().call()
  const gasEstimate = symbol === "M20" ? await tokenContract.methods.mint(toAddress, amount).estimateGas({from: fromAddress}) : await tokenContract.methods.mint(toAddress).estimateGas({from: fromAddress})
  console.log("estimated gas ok")
  return gasEstimate;
}

function limitPayloadSize(req, res, next) {
  const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
  if (req.headers["content-length"] && parseInt(req.headers["content-length"]) > MAX_PAYLOAD_SIZE) {
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

async function mintTokens(web3, fromAddress, privateKey, toAddress, amount, token) {
  try {
    // Create the contract instance
    const tokenContract = token === "ERC20" ? mockERC20Contract : mockERC721Contract;
    const signer = privateKeyToAccount(web3, privateKey);
    const nonce = await getTransactionCount(web3, signer.address);
    // Convert the amount to the smallest unit (wei-like, considering 18 decimals).
    const mintAmount = convertToWei(web3, amount.toString(), "ether");
    const estimatedGas = await estimateGasForMinting(tokenContract, fromAddress, toAddress, mintAmount);
    // Create a transaction object
    const tx = {
      to: token === "ERC20" ? ERC20 : ERC721,
      data: token === "ERC20" ? generateApprovalABI(tokenContract, "mint", [toAddress, mintAmount]) : generateApprovalABI(tokenContract, "mint", [toAddress]),
      gas: estimatedGas, // You might want to estimate this dynamically
      nonce: nonce,
      maxPriorityFeePerGas: convertToWei(web3, "2"),
      maxFeePerGas: convertToWei(web3, "100")
    };
    // Sign the transaction
    const signedTx = await signTx(web3, tx, privateKey)
    // Send the transaction and get the receipt
    const receipt = await sendSignedTx(web3, signedTx)
    console.log("Receipt mintToken(): ", receipt)
    return receipt;
  } catch (error) {
    console.error(`An error occurred while fetching the token balance: ${error}`);
  }
}

async function getTransactionCount(web3, address) {
  return await web3.eth.getTransactionCount(address);
}

function generateApprovalABI(contract, methodFunc, params) {
  console.log("Generating contract encoded ABI")
  return contract.methods[methodFunc](...params).encodeABI();
}

function privateKeyToAccount(web3, privateKey) {
  return web3.eth.accounts.privateKeyToAccount(privateKey);
}

function sendSignedTx(web3Instance, signedTx) {
  console.log("Sending SignedTx")
  return web3Instance.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
}
async function sendTxAndGetHash(web3, signedTransaction) {
  return new Promise((resolve, reject) => {
    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      .on('transactionHash', hash => {
        resolve(hash);
      })
      .on('error', error => {
        reject(error);
      });
  });
}
function signTx(web3Instance, tx, privateKey) {
  console.log("Signing Tx")
  return web3Instance.eth.accounts.signTransaction(tx, privateKey);
}
function sign(web3Instance, data, privateKey) {
  console.log("Signing data")
  return web3Instance.eth.accounts.sign(data, privateKey);
}
function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error)
      return res.status(400).send(error.details[0].message);
    next();
  };
}

module.exports = {
  createTxObject,
  checkBalances,
  estimateGas,
  generateApprovalABI,
  limitPayloadSize,
  limit,
  mintTokens,
  sendSignedTx,
  sendTxAndGetHash,
  signTx,
  sign,
  validateBody,
};
