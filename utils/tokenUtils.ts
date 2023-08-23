/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import Web3 from 'web3';
import * as Units from 'web3-utils';
import { PinoLogger } from '../logger/pino.ts';
import { ERC20, ERC721 } from '../contracts/contracts.ts';
import { BN, mockERC20Contract, mockERC721Contract } from '../config/config.ts';
import { sendSignedTransaction, signTransaction } from './signingUtils.ts';
import { fetchTransactionCount, convertPrivateKeyToAccount } from './web3Utils.ts';

/**
   * Generates the ABI encoding for method invocation on a contract.
   *
   * @param {Object} contract - The contract instance.
   * @param {string} methodName - Name of the contract method.
   * @param {Array} params - Parameters to pass to the contract method.
   * @returns {string} Returns the ABI encoded string.
   */
function generateApprovalABI(contract: any, methodName: string, params: any[]): string {
  try {
    PinoLogger.info('Generating contract encoded ABI');
    return contract.methods[methodName](...params).encodeABI();
  } catch (error: any) {
    PinoLogger.error(`Failed to generate ABI for method ${methodName}: ${error.message}`);
    throw error;
  }
}

/**
 * Converts an amount from Ether to Wei.
 *
 * @param {Object} web3 - The web3 instance.
 * @param {string} amount - Amount to convert.
 * @param {Unit} unit - The unit to convert from (default is "gwei").
 * @returns {string} The converted amount in Wei.
 */
function convertToWei(web3: Web3, amount: typeof BN, unit: Units.EtherUnits = 'gwei'): typeof BN {
  return web3.utils.toWei(amount, unit);
}

/**
 * Estimates gas required for minting tokens, considering the type of token.
 *
 * @param {Object} tokenContract - The token contract instance.
 * @param {string} fromAddress - Ethereum address of the sender.
 * @param {string} toAddress - Ethereum address of the recipient.
 * @param {string|number} amount - Amount of tokens to mint.
 * @returns {Promise<number>} Returns the estimated gas for minting.
 */
async function estimateMintingGas(tokenContract: any, fromAddress: string, toAddress: string, amount: string | number): Promise<number> {
  try {
    const symbol = await tokenContract.methods.symbol().call();
    const gasEstimate = symbol === 'M20'
      ? await tokenContract.methods.mint(toAddress, amount).estimateGas({ from: fromAddress })
      : await tokenContract.methods.mint(toAddress).estimateGas({ from: fromAddress });
    PinoLogger.info('estimated gas ok');
    return gasEstimate;
  } catch (error: any) {
    PinoLogger.error(`Failed to estimate gas for minting: ${error.message}`);
    throw error;
  }
}

/**
   * Mints tokens for a specified recipient.
   *
   * @param {Object} web3 - The web3 instance.
   * @param {string} fromAddress - Ethereum address of the sender.
   * @param {string} privateKey - Private key of the sender.
   * @param {string} toAddress - Ethereum address of the recipient.
   * @param {string|number} amount - Amount of tokens to mint. For ERC721 in this case it doesn't affect due to the smart contract only minting one nft at the time
   * @param {string} token - Token type ('ERC20' or 'ERC721').
   * @returns {Promise<Object>} Returns the transaction receipt.
   */
async function mintToken(web3: Web3, fromAddress: string, privateKey: string, toAddress: string, amount: string | number, token: 'ERC20' | 'ERC721'): Promise<any> {
  try {
    let tokenContract;
    let txTo;
    let txData;

    const mintAmount = convertToWei(web3, amount.toString(), 'ether');
    const signer = convertPrivateKeyToAccount(web3, privateKey);
    const nonce = await fetchTransactionCount(web3, signer.address);

    if (token === 'ERC20') {
      tokenContract = mockERC20Contract;
      txTo = ERC20;
      txData = generateApprovalABI(tokenContract, 'mint', [toAddress, mintAmount]);
    } else {
      tokenContract = mockERC721Contract;
      txTo = ERC721;
      txData = generateApprovalABI(tokenContract, 'mint', [toAddress]);
    }

    const estimatedGas = await estimateMintingGas(tokenContract, fromAddress, toAddress, mintAmount);
    // Create a transaction object
    const transaction = {
      to: txTo,
      data: txData,
      gas: estimatedGas,
      nonce,
      maxPriorityFeePerGas: convertToWei(web3, '2'), // TODO
      maxFeePerGas: convertToWei(web3, '100'), // TODO
    };
    // Sign the transaction
    const signedTransaction = await signTransaction(web3, transaction, privateKey);
    // Send the transaction and get the receipt
    const receipt = await sendSignedTransaction(web3, signedTransaction);
    PinoLogger.info('Receipt mintToken(): ', receipt);
    return receipt;
  } catch (error: any) {
    PinoLogger.error(`An error occurred while fetching the token balance: ${error}`);
    throw error;
  }
}

export { estimateMintingGas, mintToken, generateApprovalABI };
