/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import { createTransactionObject, sendSignedTransaction } from '../../utils/index.ts';
import { PinoLogger } from '../../logger/pino.ts';

const { BN } = (Web3.utils as any);

jest.mock('../../logger/pino.ts', () => ({
  PinoLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('createTransactionObject', () => {
  it('should create a transaction object correctly', () => {
    const mockWeb3Instance = new Web3();
    mockWeb3Instance.utils.toHex = jest.fn((value) => `hex-${value}`);

    const options = {
      web3: mockWeb3Instance,
      nonce: '1',
      from: '0x123',
      to: '0x456',
      data: 'someData',
      gasEstimate: new BN(50000),
      gasPrice: new BN(20),
      maxGasLimit: new BN(60000),
    };

    const result = createTransactionObject(options);

    expect(result).toEqual({
      nonce: 'hex-1',
      from: '0x123',
      to: '0x456',
      data: 'someData',
      gas: new BN(Math.min(options.gasEstimate, options.maxGasLimit)),
      gasPrice: 'hex-20',
    });
  });
});

describe('sendSignedTransaction', () => {
  const mockSendSignedTransaction = jest.fn();

  // Mock Web3 instance
  const mockWeb3 = {
    eth: {
      sendSignedTransaction: mockSendSignedTransaction,
    },
  } as unknown as Web3;

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should send a signed transaction successfully', async () => {
    const mockResult = 'successful-transaction-hash';
    mockSendSignedTransaction.mockResolvedValueOnce(mockResult);

    const signedTx = {
      raw: 'some-raw-transaction',
      rawTransaction: 'some-raw-transaction',
    };

    const result = await sendSignedTransaction(mockWeb3, signedTx);

    expect(result).toBe(mockResult);
    expect(PinoLogger.info).toHaveBeenCalledWith('Sending Signed Transaction');
    expect(PinoLogger.error).not.toHaveBeenCalled();
  });

  it('should throw an error when sending fails', async () => {
    const mockError2 = new Error('Send failed');
    mockSendSignedTransaction.mockImplementationOnce(() => Promise.reject(mockError2));
    const signedTx = {
      raw: 'some-raw-transaction',
      rawTransaction: 'some-raw-transaction',
    };

    let caughtError;
    try {
      await sendSignedTransaction(mockWeb3, signedTx);
    } catch (error: any) {
      caughtError = error;
    }
    // console.log(caughtError, "Caughterror");
    // console.log(mockError2, "mockError2");
    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError?.message).toBe('Send failed');
    expect(PinoLogger.error).toHaveBeenCalledWith(`Failed to send signed transaction: ${mockError2.message}`);
  });
});
