/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import { PinoLogger } from '../logger/pino.ts';
import { BN } from '../config/config.ts';
import { SignedTransaction, TransactionOptions, TransactionObject } from '../types.ts';

/**
 * Creates a transaction object with necessary details.
 *
 * @param {TransactionOptions} options - Contains details for the transaction.
 * @returns {TransactionObject} Returns the transaction object.
 */

function createTransactionObject(options: TransactionOptions): TransactionObject {
  const {
    web3, nonce, from, to, data, gasEstimate, gasPrice, maxGasLimit,
  } = options;

  const finalGasLimit = new BN(Math.min(gasEstimate, maxGasLimit));
  PinoLogger.info(`Creating TxObject with finalGasLimit set to: ${finalGasLimit}`);
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
   * @param {SignedTransaction} signedTransaction - The signed transaction object.
   * @returns {Promise<Object>} Returns the transaction receipt.
   */
async function sendSignedTransaction(
  web3Instance: Web3,
  signedTransaction: SignedTransaction,
): Promise<any> {
  try {
    PinoLogger.info('Sending Signed Transaction');
    return await web3Instance.eth.sendSignedTransaction(
      signedTransaction.raw || signedTransaction.rawTransaction,
    );
  } catch (error: any) {
    PinoLogger.error(`Failed to send signed transaction: ${error.message}`);
    throw error;
  }
}

/**
   * Sends a signed transaction and retrieves the transaction hash.
   *
   * @param {Object} web3Instance - The web3 instance.
   * @param {SignedTransaction} signedTransaction - The signed transaction object.
   * @returns {Promise<string>} Returns the transaction hash.
   */
// eslint-disable-next-line max-len
async function sendTransactionAndGetHash(web3Instance: Web3, signedTransaction: any): Promise<string> {
  return new Promise((resolve, reject) => {
    web3Instance.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      .on('transactionHash', (hash) => {
        PinoLogger.info('Sending Signed Transaction');
        resolve(hash);
      })
      .on('error', (error) => {
        PinoLogger.error(`Failed to get transaction hash: ${error.message}`);
        reject(error);
      });
  });
}

/**
   * Sends a signed transaction and retrieves the transaction hash.
   *
   * @param {Object} web3Instance - The web3 instance.
   * @param {Object} transaction - The transaction object.
   * @param {string} privateKey
   * @returns {Promise<string>} Returns the transaction hash.
   */
function signTransaction(web3Instance: Web3, transaction: any, privateKey: string): Promise<any> {
  try {
    PinoLogger.info('Signing transaction');
    return web3Instance.eth.accounts.signTransaction(transaction, privateKey);
  } catch (error: any) {
    PinoLogger.error(`Failed to sign transaction: ${error.message}`);
    throw error;
  }
}

/**
   * Sends a signed transaction and retrieves the transaction hash.
   *
   * @param {Object} web3Instance - The web3 instance.
   * @param {Object} data - The transaction object.
   * @param {string} privateKey
   * @returns {Promise<string>} Returns the transaction hash.
   */
function signData(web3Instance: Web3, data: string, privateKey: string): any {
  try {
    PinoLogger.info('Signing data');
    return web3Instance.eth.accounts.sign(data, privateKey);
  } catch (error: any) {
    PinoLogger.error(`Failed to sign data: ${error.message}`);
    throw error;
  }
}

export {
  createTransactionObject,
  signTransaction,
  signData,
  sendSignedTransaction,
  sendTransactionAndGetHash,
};
