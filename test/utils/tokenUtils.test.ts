/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import {
  generateApprovalABI,
  convertToWei,
  estimateMintingGas,
  mintToken,
} from '../../utils/index.ts';
import { PinoLogger } from '../../logger/pino.ts';

const { BN } = (Web3.utils as any);

jest.mock('../../logger/pino.ts', () => ({
  PinoLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

function createMockTokenContract(type: 'ERC20' | 'ERC721') {
  const mockCall = jest.fn();
  const mockEstimateGas = jest.fn();
  const mockEncodeABI = jest.fn();

  const mockSymbol = jest.fn().mockReturnValue({ call: mockCall });

  let mockMint;
  if (type === 'ERC20') {
    mockMint = jest.fn().mockReturnValue({
      estimateGas: mockEstimateGas,
      encodeABI: mockEncodeABI,
    });
  } else if (type === 'ERC721') {
    mockMint = jest.fn().mockReturnValue({
      estimateGas: mockEstimateGas,
      encodeABI: mockEncodeABI,
    });
  }

  const mockApprove = jest.fn().mockReturnValue({ encodeABI: mockEncodeABI });

  return {
    mockTokenContract: {
      methods: {
        symbol: mockSymbol,
        mint: mockMint,
        approve: mockApprove,
      },
    },
    mockHelpers: {
      mockCall,
      mockEstimateGas,
      mockEncodeABI,
    },
  };
}

const mockedTokenUtils = jest.requireMock('../../utils/tokenUtils.ts');
const mockWeb3Instance = {
  utils: {
    toWei: jest.fn(),
  },
  eth: {
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
  },
};

describe('generateApprovalABI', () => {
  let mockContract: any;
  let mockHelpers: any;

  beforeEach(() => {
    jest.resetAllMocks();
    const mockData = createMockTokenContract('ERC20');
    mockContract = mockData.mockTokenContract;
    mockHelpers = mockData.mockHelpers;
  });

  it('should successfully generate encoded ABI', () => {
    const mockMethodName = 'approve';
    const mockParams = ['param1', 'param2'];

    // mockHelpers.mockEncodeABI.mockReturnValue('mockedABI');
    mockContract.methods.approve = jest.fn().mockReturnValue({
      encodeABI: jest.fn().mockReturnValue('mockedABI'),
    });

    const result = generateApprovalABI(mockContract, mockMethodName, mockParams);

    expect(result).toBe('mockedABI');
    expect(PinoLogger.info).toHaveBeenCalledWith('Generating contract encoded ABI');
    expect(mockContract.methods[mockMethodName]).toHaveBeenCalledWith(...mockParams);
    expect(mockContract.methods[mockMethodName]().encodeABI).toHaveBeenCalled();
  });

  it('should throw and log an error if ABI generation fails', () => {
    const mockError = new Error('ABI generation failed');
    const mockMethodName = 'failMethod';

    mockContract.methods[mockMethodName] = jest.fn().mockImplementation(() => { throw mockError; });

    expect(() => generateApprovalABI(mockContract, mockMethodName, [])).toThrow(mockError);
    expect(PinoLogger.error).toHaveBeenCalledWith(`Failed to generate ABI for method ${mockMethodName}: ${mockError.message}`);
  });
});

describe('convertToWei', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should convert amount to Wei using default unit (gwei)', () => {
    const mockAmount = new BN('1000');
    const mockResult = new BN('1000000000');

    mockWeb3Instance.utils.toWei.mockReturnValue(mockResult);

    const result = convertToWei(mockWeb3Instance as unknown as Web3, mockAmount);

    expect(result).toEqual(mockResult);
    expect(mockWeb3Instance.utils.toWei).toHaveBeenCalledWith(mockAmount, 'gwei');
  });

  it('should convert amount to Wei using provided unit', () => {
    const mockAmount = new BN('2');
    const mockResult = new BN('2000000000000000000');

    mockWeb3Instance.utils.toWei.mockReturnValue(mockResult);

    const result = convertToWei(
        mockWeb3Instance as unknown as Web3,
        mockAmount,
        'wei',
    );

    expect(result).toEqual(mockResult);
    expect(mockWeb3Instance.utils.toWei).toHaveBeenCalledWith(mockAmount, 'wei');
  });
});

describe('estimateMintingGas', () => {
  let mockTokenContract: any;
  let mockHelpers: any;

  beforeEach(() => {
    jest.resetAllMocks();
    const mocks = createMockTokenContract('ERC20');
    mockTokenContract = mocks.mockTokenContract;
    mockHelpers = mocks.mockHelpers;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should estimate gas correctly when symbol is M20', async () => {
    mockHelpers.mockCall.mockResolvedValue('M20');
    mockHelpers.mockEstimateGas.mockResolvedValue(21000);

    const result = await estimateMintingGas(mockTokenContract, '0xFromAddress', '0xToAddress', '100');

    expect(result).toBe(21000);
    expect(mockHelpers.mockCall).toHaveBeenCalled();
    expect(mockTokenContract.methods.mint).toHaveBeenCalledWith('0xToAddress', '100');
    expect(mockHelpers.mockEstimateGas).toHaveBeenCalledWith({ from: '0xFromAddress' });
  });

  it('should estimate gas correctly when symbol is not M20', async () => {
    mockHelpers.mockCall.mockResolvedValue('NOTM20');
    mockHelpers.mockEstimateGas.mockResolvedValue(20000);

    const result = await estimateMintingGas(mockTokenContract, '0xFromAddress', '0xToAddress', '100');

    expect(result).toBe(20000);
    expect(mockHelpers.mockCall).toHaveBeenCalled();
    expect(mockTokenContract.methods.mint).toHaveBeenCalledWith('0xToAddress');
    expect(mockHelpers.mockEstimateGas).toHaveBeenCalledWith({ from: '0xFromAddress' });
  });

  it('should throw an error if there is a problem estimating gas', async () => {
    mockHelpers.mockCall.mockRejectedValue(new Error('Failed to get symbol'));

    await expect(estimateMintingGas(mockTokenContract, '0xFromAddress', '0xToAddress', '100')).rejects.toThrow('Failed to get symbol');
  });
});

describe('mintToken', () => {
  const mockPrivateKey = 'mockPrivateKey';
  const mockTokenAddress = '0xTokenAddress';
  const mockFromAddress = '0xFromAddress';
  const mockToAddress = '0xToAddress';
  const mockAmount = '1000';
  beforeEach(() => {
    jest.clearAllMocks();
    // Set return values for the mocks
    mockWeb3Instance.utils.toWei.mockReturnValue(new BN('1000000'));
    mockWeb3Instance.eth.accounts.privateKeyToAccount.mockReturnValue({ address: '0xMockedSignerAddress' });
    mockWeb3Instance.eth.accounts.signTransaction.mockReturnValue({ rawTransaction: '0xMockedRawTransaction' });
    mockWeb3Instance.eth.sendSignedTransaction.mockReturnValue({ transactionHash: '0xMockedTransactionHash' });

    // mockedTokenUtils.generateApprovalABI.mockReturnValue('mockABI');
    // mockedTokenUtils.estimateMintingGas.mockResolvedValue(21000);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should mint an ERC20 token successfully', async () => {
    const { mockTokenContract } = createMockTokenContract('ERC20');
    mockedTokenUtils.generateApprovalABI(mockTokenContract, 'mint', [mockToAddress, mockAmount]);
    mockedTokenUtils.estimateMintingGas(mockTokenContract, mockFromAddress, mockToAddress, mockAmount);

    const result = await mintToken(mockWeb3Instance as any, mockTokenContract, mockTokenAddress, mockFromAddress, mockPrivateKey, mockToAddress, mockAmount);

    expect(result).toBeDefined();
    expect(result).toEqual({ transactionHash: '0xMockedTransactionHash' });
    expect(mockedTokenUtils.generateApprovalABI).toHaveBeenCalledWith(mockTokenContract, 'mint', [mockToAddress, mockAmount]);
    expect(mockedTokenUtils.estimateMintingGas).toHaveBeenCalledWith(mockTokenContract, mockFromAddress, mockToAddress, mockAmount);
  });

  it('should mit an ERC721 token successfully', async () => {
    const { mockTokenContract } = createMockTokenContract('ERC721');
    mockedTokenUtils.generateApprovalABI(mockTokenContract, 'mint', [mockToAddress, mockAmount]);
    mockedTokenUtils.estimateMintingGas(mockTokenContract, mockFromAddress, mockToAddress, mockAmount);

    const receipt = await mintToken(mockWeb3Instance as any, mockTokenContract, mockTokenAddress, mockFromAddress, mockPrivateKey, mockToAddress, mockAmount);

    expect(receipt).toBeDefined();
    expect(receipt).toEqual({ transactionHash: '0xMockedTransactionHash' });
    expect(mockedTokenUtils.generateApprovalABI).toHaveBeenCalledWith(mockTokenContract, 'mint', [mockToAddress, mockAmount]);
    expect(mockedTokenUtils.estimateMintingGas).toHaveBeenCalledWith(mockTokenContract, mockFromAddress, mockToAddress, mockAmount);
  });

  it('should handle errors', async () => {
    const { mockTokenContract } = createMockTokenContract('ERC20');
    const errorMessage = 'Error from mocked toWei';

    mockWeb3Instance.utils.toWei = jest.fn(() => {
      throw new Error(errorMessage);
    });

    let error;
    try {
      await mintToken(mockWeb3Instance as any, mockTokenContract, mockTokenAddress, mockFromAddress, mockPrivateKey, mockToAddress, mockAmount);
    } catch (e: any) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.message).toContain(errorMessage);
  });
});
