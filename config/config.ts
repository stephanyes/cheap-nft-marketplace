/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import {
  ABI,
  CONTRACT_ADDRESS,
  ERC20_ABI,
  ERC721_ABI,
  ERC20,
  ERC721,
} from '../contracts/contracts.ts';
import { PinoLogger } from '../logger/pino.ts';

const web3: Web3 = new Web3(process.env.INFURA_PROJECT_ID as string);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
const mockERC20Contract = new web3.eth.Contract(ERC20_ABI, ERC20);
const mockERC721Contract = new web3.eth.Contract(ERC721_ABI, ERC721);
const { BN } = (Web3.utils as any);

async function getERC20Decimals(): Promise<string> {
  try {
    return await mockERC20Contract.methods.decimals().call();
  } catch (err: any) {
    PinoLogger.error(err.message);
    throw new Error(`Failed to get ERC20 decimals: ${err.message}`);
  }
}

export {
  web3,
  contract,
  mockERC20Contract,
  mockERC721Contract,
  BN,
  getERC20Decimals,
};
