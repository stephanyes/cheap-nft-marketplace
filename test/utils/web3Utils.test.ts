/* eslint-disable max-len */
import Web3 from 'web3';
import {
  estimateTransactionGas,
  fetchTransactionCount,
  convertPrivateKeyToAccount,
  checkBalances,
} from '../../utils/index.ts';
import { BN } from '../../config/config.ts';
import { ERC20_ABI, ERC20 } from '../../contracts/contracts.ts';

jest.mock('../../logger/pino.ts', () => ({
  PinoLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockWeb3Instance = {
  utils: {
    toWei: jest.fn(),
  },
  eth: {
    Contract: jest.fn(() => ({
      methods: {
        balanceOf: jest.fn().mockReturnValue({
          call: jest.fn().mockResolvedValue('1000'),
        }),
        symbol: jest.fn().mockResolvedValue('M20'),
      },
    })),
    accounts: {
      privateKeyToAccount: jest.fn().mockReturnValue({ address: '0xMockedAddress' }),
      signTransaction: jest.fn().mockResolvedValue({
        rawTransaction: '0xMockedRawTransaction',
      }),
    },
    getTransactionCount: jest.fn().mockResolvedValue(1),
    sendSignedTransaction: jest.fn().mockResolvedValue({
      transactionHash: '0xMockedTransactionHash',
    }),
    getBalance: jest.fn().mockResolvedValue('1000'),
  },
};

describe('Ethereum utility functions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should estimate transaction gas', async () => {
    const mockContract = {
      methods: {
        myMethod: jest.fn().mockReturnValue({
          estimateGas: jest.fn().mockResolvedValue('21000'),
        }),
      },
    };

    const gas = await estimateTransactionGas(mockContract, 'myMethod', [], '0xSenderAddress');
    expect(gas).toBe(BigInt(21000));
  });

  it('should fetch transaction count', async () => {
    mockWeb3Instance.eth.getTransactionCount = jest.fn().mockResolvedValue(5);

    const txCount = await fetchTransactionCount(mockWeb3Instance as unknown as Web3, '0xAddress');
    expect(txCount).toBe(5);
  });

  it('should fetch transaction count', async () => {
    const privateKey = 'x0SomePrivateKey';
    mockWeb3Instance.eth.accounts.privateKeyToAccount = jest.fn().mockResolvedValue({ address: '0xMockedAddress' });

    const address = await convertPrivateKeyToAccount(mockWeb3Instance as unknown as Web3, privateKey);
    expect(address.address).toBe('0xMockedAddress');
  });

  it('should check the ether balance and ERC20 balance for a bidder', async () => {
    const mockBalanceOf = jest.fn().mockReturnValue({
      call: jest.fn().mockResolvedValue('1000'),
    });

    const mockSymbol = jest.fn().mockReturnValue({
      call: jest.fn().mockResolvedValue('M20'),
    });

    const mockContractMethods = {
      balanceOf: mockBalanceOf,
      symbol: mockSymbol,
    };

    mockWeb3Instance.eth.Contract = jest.fn().mockReturnValue({ methods: mockContractMethods });

    const account = '0xMockedAddress';
    const type = 'bidder';
    const ERC20ContractAddress = ERC20;
    const requiredTokenAmount = new BN('900');
    const estimatedGas = new BN('10');
    const gasPrice = '10';
    mockWeb3Instance.eth.getBalance = jest.fn().mockResolvedValue(10000);
    // mockWeb3Instance.eth.Contract = jest.fn().mockReturnValue({ methods: mockContractMethods });

    const result = await checkBalances(
      mockWeb3Instance as unknown as Web3,
      account,
      type,
      ERC20ContractAddress,
      requiredTokenAmount,
      estimatedGas,
      gasPrice,
    );

    expect(result).toBeTruthy();
    expect(mockWeb3Instance.eth.getBalance).toHaveBeenCalledWith(account);
    expect(mockWeb3Instance.eth.Contract).toHaveBeenCalledWith(ERC20_ABI, ERC20ContractAddress);
  });
});
