/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
// import Account from 'web3-core';
import { PinoLogger } from '../logger/pino.ts';
import { ERC20_ABI } from '../contracts/contracts.ts';
import { BN } from '../config/config.ts';

/**
 * Estimates the gas required for a specific contract method invocation.
 *
 * @param contract - The contract instance.
 * @param methodName - Name of the contract method.
 * @param params - Parameters to pass to the contract method.
 * @param sender - Ethereum address of the sender.
 * @returns Returns the estimated gas.
 */
async function estimateTransactionGas(
  contract: any,
  methodName: string,
  params: any[],
  sender: string,
): Promise<bigint> {
  try {
    PinoLogger.info('Estimating gas');
    return BigInt(await contract.methods[methodName](...params).estimateGas({ from: sender }));
  } catch (error: any) {
    PinoLogger.error(`Failed to estimate gas for method ${methodName}: ${error.message}`);
    throw error;
  }
}

/**
   * Retrieves the number of transactions sent from an address.
   *
   * @param web3 - The web3 instance.
   * @param address - Ethereum address.
   * @returns Returns the transaction count.
   */
async function fetchTransactionCount(web3: Web3, address: string): Promise<number> {
  try {
    return await web3.eth.getTransactionCount(address);
  } catch (error: any) {
    PinoLogger.error(`Failed to get transaction count for address ${address}: ${error.message}`);
    throw error;
  }
}

/**
   * Converts a private key into an account object.
   *
   * @param web3 - The web3 instance.
   * @param privateKey - Private key of the account.
   * @returns Returns the account object.
   */
function convertPrivateKeyToAccount(web3: Web3, privateKey: string): any {
  // TODO change this type to Account from somewhere
  try {
    return web3.eth.accounts.privateKeyToAccount(privateKey);
  } catch (error: any) {
    PinoLogger.error(`Failed to convert private key to account: ${error.message}`);
    throw error;
  }
}

/**
 * Checks the balances (Ether and ERC20) for a given account.
 * Ensures the account has enough Ether for gas and enough tokens for placing a bid.
 *
 * @param web3 - The web3 instance.
 * @param account - Ethereum address of the account.
 * @param type - Type of user ('bidder' or 'seller').
 * @param ERC20ContractAddress - Address of the ERC20 token contract.
 * @param requiredTokenAmount - Required token amount for the transaction.
 * @param estimatedGas - Estimated gas required for the transaction.
 * @param gasPrice - Current gas price.
 * @returns Returns true if the account has sufficient balances.
 */
async function checkBalances(
  web3: Web3,
  account: string,
  type: 'bidder' | 'seller',
  ERC20ContractAddress: string,
  requiredTokenAmount: typeof BN,
  estimatedGas: typeof BN,
  gasPrice: string,
): Promise<boolean> {
  // Check Ether balance for gas
  const etherBalance = await web3.eth.getBalance(account);
  const requiredEther = BigInt(estimatedGas) * BigInt(gasPrice);
  if (BigInt(etherBalance) < requiredEther) { throw new Error(`Insufficient Ether for gas for account ${account}.`); }
  if (type === 'bidder') {
    // Check ERC20 balance only for bidder
    const ERC20Contract = new web3.eth.Contract(ERC20_ABI, ERC20ContractAddress);
    const tokenBalance = await ERC20Contract.methods.balanceOf(account).call();
    const symbol = await ERC20Contract.methods.symbol().call();
    if (BigInt(tokenBalance) < BigInt(requiredTokenAmount)) { throw new Error(`Insufficient ERC20 token balance for account ${account}.`); }
    PinoLogger.info(`${account} balance: ${etherBalance} ETH & ${tokenBalance} ${symbol} token`);
  } else {
    PinoLogger.info(`${account} balance: ${etherBalance} ETH`);
  }
  return true;
}

export {
  estimateTransactionGas,
  fetchTransactionCount,
  convertPrivateKeyToAccount,
  checkBalances,
};
