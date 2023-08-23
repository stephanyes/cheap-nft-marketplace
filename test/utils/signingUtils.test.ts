/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import {
  createTransactionObject,
  sendSignedTransaction,
  sendTransactionAndGetHash,
  signTransaction,
  signData,
} from '../../utils/index.ts';
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

describe('sendTransactionAndGetHash', () => {
  it('should resolve with hash when transactionHash event is emitted', async () => {
    // Had to create for each suit this const below
    // mockSendSignedTransaction because trying
    // to execute this from outside each it()
    // was causing some issues
    const mockSendSignedTransaction: any = {
      on: jest.fn().mockImplementation(() => mockSendSignedTransaction),
    };

    const mockWeb3 = {
      eth: {
        sendSignedTransaction: jest.fn(() => mockSendSignedTransaction),
      },
    } as unknown as Web3;

    const mockHash = 'some-mock-hash';
    await mockSendSignedTransaction
      .on.mockImplementation(
        (event: string, callback: (arg0: string) => void) => {
          if (event === 'transactionHash') {
            callback(mockHash);
          }
          return mockSendSignedTransaction;
        },
      );

    const signedTx = {
      rawTransaction: 'some-raw-transaction',
    };

    const result = await sendTransactionAndGetHash(mockWeb3, signedTx);

    expect(result).toBe(mockHash);
    expect(PinoLogger.info).toHaveBeenCalledWith('Sending Signed Transaction');
  });
  it('should reject with error when error event is emitted', async () => {
    const mockSendSignedTransaction: any = {
      on: jest.fn().mockImplementation(() => mockSendSignedTransaction),
    };
    const mockWeb3 = {
      eth: {
        sendSignedTransaction: jest.fn(() => mockSendSignedTransaction),
      },
    } as unknown as Web3;
    const mockError = new Error('Some Error');
    await mockSendSignedTransaction
      .on.mockImplementation(
        (event: string, callback: (arg0: Error) => void) => {
          if (event === 'error') {
            callback(mockError);
          }
          return mockSendSignedTransaction;
        },
      );

    const signedTx = {
      rawTransaction: 'some-raw-transaction',
    };

    await expect(sendTransactionAndGetHash(mockWeb3, signedTx)).rejects.toEqual(mockError);
    expect(PinoLogger.error).toHaveBeenCalledWith(`Failed to get transaction hash: ${mockError.message}`);
  });
});

describe('signTransaction', () => {
  let mockWeb3: any;
  const mockTransaction = { rawTransaction: 'some-raw-transaction' };
  const mockPrivateKey = 'private-key';

  beforeEach(() => {
    mockWeb3 = {
      eth: {
        accounts: {
          signTransaction: jest.fn(),
        },
      },
    };
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should sign the transaction and return the result', async () => {
    const mockSignedTx = { some: 'signed-transaction' };
    mockWeb3.eth.accounts.signTransaction.mockResolvedValue(mockSignedTx);

    const result = await signTransaction(mockWeb3, mockTransaction, mockPrivateKey);

    expect(result).toBe(mockSignedTx);
    expect(PinoLogger.info).toHaveBeenCalledWith('Signing transaction');
    expect(mockWeb3.eth.accounts.signTransaction)
      .toHaveBeenCalledWith(mockTransaction, mockPrivateKey);
  });

  it('should throw and log an error if signing fails', async () => {
    const mockErrorNew = new Error('Some signing error');
    mockWeb3.eth.accounts.signTransaction.mockRejectedValue(mockErrorNew);

    await expect(signTransaction(mockWeb3, mockTransaction, mockPrivateKey))
      .rejects.toEqual(mockErrorNew);
    expect(PinoLogger.error).toHaveBeenCalledWith(`Failed to sign transaction: ${mockErrorNew.message}`);
  });
});

describe('signData', () => {
  let mockWeb3: any;
  const mockData = 'some-data';
  const mockPrivateKey = 'private-key';

  beforeEach(() => {
    mockWeb3 = {
      eth: {
        accounts: {
          sign: jest.fn(),
        },
      },
    };
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should successfully sign the data', async () => {
    const mockSignedData = { signature: 'mockSignature' };
    mockWeb3.eth.accounts.sign.mockReturnValue(mockSignedData);

    const result = signData(mockWeb3, mockData, mockPrivateKey);
    expect(result).toEqual(mockSignedData);
    expect(PinoLogger.info).toHaveBeenCalledWith('Signing data');
  });

  it('should throw and log an error if signing fails', () => {
    const mockError = new Error('Some signing error');
    mockWeb3.eth.accounts.sign.mockImplementation(() => { throw mockError; });

    expect(() => signData(mockWeb3, mockData, mockPrivateKey)).toThrow(mockError);
    expect(PinoLogger.error).toHaveBeenCalledWith(`Failed to sign data: ${mockError.message}`);
  });
});
