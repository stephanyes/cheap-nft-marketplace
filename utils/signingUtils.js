const logger = require('../pino/pino');

/**
 * Creates a transaction object with necessary details.
 *
 * @param {Object} options - Contains details for the transaction.
 * @returns {Object} Returns the transaction object.
 */

function createTransactionObject({
  web3, nonce, from, to, data, gasEstimate, gasPrice, maxGasLimit,
}) {
  const finalGasLimit = Math.min(gasEstimate, maxGasLimit);
  logger.info(`Creating TxObject with finalGasLimit set to: ${finalGasLimit}`);
  return {
    nonce: web3.utils.toHex(nonce),
    from,
    to,
    data,
    gas: finalGasLimit,
    gasPrice: web3.utils.toHex(gasPrice),
  };
}

/**
   * Sends a signed transaction to the Ethereum network.
   *
   * @param {Object} web3Instance - The web3 instance.
   * @param {Object} signedTx - The signed transaction object.
   * @returns {Promise<Object>} Returns the transaction receipt.
   */
function sendSignedTransaction(web3Instance, signedTx) {
  try {
    logger.info('Sending SignedTx');
    return web3Instance.eth.sendSignedTransaction(signedTx.raw || signedTx.rawTransaction);
  } catch (error) {
    logger.error(`Failed to send signed transaction: ${error.message}`);
    throw error;
  }
}

/**
   * Sends a signed transaction and retrieves the transaction hash.
   *
   * @param {Object} web3 - The web3 instance.
   * @param {Object} signedTransaction - The signed transaction object.
   * @returns {Promise<string>} Returns the transaction hash.
   */
async function sendTransactionAndGetHash(web3, signedTransaction) {
  return new Promise((resolve, reject) => {
    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      .on('transactionHash', (hash) => {
        resolve(hash);
      })
      .on('error', (error) => {
        logger.error(`Failed to get transaction hash: ${error.message}`);
        reject(error);
      });
  });
}

/**
   * Sends a signed transaction and retrieves the transaction hash.
   *
   * @param {Object} web3 - The web3 instance.
   * @param {Object} signedTransaction - The signed transaction object.
   * @returns {Promise<string>} Returns the transaction hash.
   */
function signTransaction(web3Instance, transaction, privateKey) {
  try {
    logger.info('Signing transaction');
    return web3Instance.eth.accounts.signTransaction(transaction, privateKey);
  } catch (error) {
    logger.error(`Failed to sign transaction: ${error.message}`);
    throw error;
  }
}

/**
   * Sends a signed transaction and retrieves the transaction hash.
   *
   * @param {Object} web3 - The web3 instance.
   * @param {Object} signedTransaction - The signed transaction object.
   * @returns {Promise<string>} Returns the transaction hash.
   */
function signData(web3Instance, data, privateKey) {
  try {
    logger.info('Signing data');
    return web3Instance.eth.accounts.sign(data, privateKey);
  } catch (error) {
    logger.error(`Failed to sign data: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createTransactionObject,
  signTransaction,
  signData,
  sendSignedTransaction,
  sendTransactionAndGetHash,
};
