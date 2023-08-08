const rateLimit = require("express-rate-limit");

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

const mintTokens = async (web3Instance, tokenABI, tokenContract, fromAddress, privateKey, toAddress, amount) => {
  const signer = web3Instance.eth.accounts.privateKeyToAccount(process.env.USER_A_PK);
  web3Instance.eth.accounts.wallet.add(signer);
  const contract = new web3Instance.eth.Contract(tokenABI, tokenContract);
  // const mintAmount = web3Instance.utils.toWei(amount.toString(), 'ether');
  
  // // encodeABI creates the data for the function call
  // const mintData = contractToken.methods.mint(fromAddress, mintAmount).encodeABI();

  // // Get the nonce
  // const nonce = await web3Instance.eth.getTransactionCount(signer.address);
  
  // // Get the current gas price from the network
  // const gasPrice = await web3Instance.eth.getGasPrice();
  
  // const tx = {
  //   to: tokenContract,
  //   data: mintData,
  //   gas: 500000,
  //   nonce: nonce, // Add the nonce to the transaction object
  //   gasPrice: gasPrice // Add the gas price to the transaction object
  // };
  
  // const signedTx = await web3Instance.eth.accounts.signTransaction(tx, signer.privateKey);
  // return web3Instance.eth.sendSignedTransaction(signedTx.rawTransaction);
  
  // console.log("contract ******************", contract)
  // let money = web3Instance.utils.toHex(web3Instance.utils.toWei("1", 'ether'));
  // console.log('money ', money)
  // const test = await contract.methods.transfer(toAddress, money).send({
  //   from: signer.address,
  //   gas: 5000000 
  // })
  // console.log("TEST &&&&&&& ", test)
  const tokenBalance = await contract.methods.balanceOf(fromAddress).call();
  console.log("tokenBalance ", tokenBalance)
  const decimals = await contract.methods.decimals().call();
  console.log("decimals ", decimals)
  const divisor = BigInt('10') ** BigInt(decimals);

  const wholePart = (tokenBalance / divisor).toString();
  const fractionalPartBigInt = tokenBalance % divisor;
  const fractionalPart = fractionalPartBigInt.toString().padStart(Number(decimals), '0');  // Convert decimals to number

  const formattedBalance = `${wholePart}.${fractionalPart}`;
  console.log("Formatted Balance: ", formattedBalance);

  // return "tokenBalance";
};


module.exports = {
  validateBody,
  limitPayloadSize,
  limit,
  createAccounts,
  fetchAndSetAccounts,
  getAccounts,
  mintTokens
};
