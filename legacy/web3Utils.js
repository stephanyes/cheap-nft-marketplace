// /* eslint-disable max-len */
// const { ERC20_ABI } = require('../contracts/contracts');
// const logger = require('../logger/pino');

// /**
//  * Estimates the gas required for a specific contract method invocation.
//  *
//  * @param {Object} contract - The contract instance.
//  * @param {string} methodName - Name of the contract method.
//  * @param {Array} params - Parameters to pass to the contract method.
//  * @param {string} sender - Ethereum address of the sender.
//  * @returns {Promise<number>} Returns the estimated gas.
//  */
// function estimateTransactionGas(contract, methodName, params, sender) {
//   try {
//     logger.info('Estimating gas');
//     return contract.methods[methodName](...params).estimateGas({ from: sender });
//   } catch (error) {
//     logger.error(`Failed to estimate gas for method ${methodName}: ${error.message}`);
//     throw error;
//   }
// }

// /**
//    * Retrieves the number of transactions sent from an address.
//    *
//    * @param {Object} web3 - The web3 instance.
//    * @param {string} address - Ethereum address.
//    * @returns {Promise<number>} Returns the transaction count.
//    */
// async function fetchTransactionCount(web3, address) {
//   try {
//     return await web3.eth.getTransactionCount(address);
//   } catch (error) {
//     logger.error(`Failed to get transaction count for address ${address}: ${error.message}`);
//     throw error;
//   }
// }

// /**
//    * Converts a private key into an account object.
//    *
//    * @param {Object} web3 - The web3 instance.
//    * @param {string} privateKey - Private key of the account.
//    * @returns {Object} Returns the account object.
//    */
// function convertPrivateKeyToAccount(web3, privateKey) {
//   try {
//     return web3.eth.accounts.privateKeyToAccount(privateKey);
//   } catch (error) {
//     logger.error(`Failed to convert private key to account: ${error.message}`);
//     throw error;
//   }
// }

// /**
//  * Checks the balances (Ether and ERC20) for a given account.
//  * Ensures the account has enough Ether for gas and enough tokens for placing a bid.
//  *
//  * @param {Object} web3 - The web3 instance.
//  * @param {string} account - Ethereum address of the account.
//  * @param {string} type - Type of user ('bidder' or 'seller').
//  * @param {string} ERC20ContractAddress - Address of the ERC20 token contract.
//  * @param {BigInt} requiredTokenAmount - Required token amount for the transaction.
//  * @param {BigInt} estimatedGas - Estimated gas required for the transaction.
//  * @param {BigInt} gasPrice - Current gas price.
//  * @returns {boolean} Returns true if the account has sufficient balances.
//  */
// async function checkBalances(web3, account, type, ERC20ContractAddress, requiredTokenAmount, estimatedGas, gasPrice) {
//   // Check Ether balance for gas
//   const etherBalance = await web3.eth.getBalance(account);
//   const requiredEther = BigInt(estimatedGas) * BigInt(gasPrice);
//   if (BigInt(etherBalance) < requiredEther) { throw new Error(`Insufficient Ether for gas for account ${account}.`); }
//   if (type === 'bidder') {
//     // Check ERC20 balance only for bidder
//     const ERC20Contract = new web3.eth.Contract(ERC20_ABI, ERC20ContractAddress);
//     const tokenBalance = await ERC20Contract.methods.balanceOf(account).call();
//     const symbol = await ERC20Contract.methods.symbol().call();
//     if (BigInt(tokenBalance) < BigInt(requiredTokenAmount)) { throw new Error(`Insufficient ERC20 token balance for account ${account}.`); }
//     logger.info(`${account} balance: ${etherBalance} ETH & ${tokenBalance} ${symbol} token`);
//   } else {
//     logger.info(`${account} balance: ${etherBalance} ETH`);
//   }
//   return true;
// }

// module.exports = {
//   estimateTransactionGas,
//   fetchTransactionCount,
//   convertPrivateKeyToAccount,
//   checkBalances,
// };
