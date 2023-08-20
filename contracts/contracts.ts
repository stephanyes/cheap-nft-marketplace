import { AbiItem } from 'web3-utils'
const { CONTRACT_ADDRESS } = process.env;

type Address = string;

const ABI: AbiItem[] = [{
  inputs: [{
    components: [{ internalType: 'address', name: 'collectionAddress', type: 'address' }, { internalType: 'address', name: 'erc20Address', type: 'address' }, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }, { internalType: 'uint256', name: 'bid', type: 'uint256' }], internalType: 'struct Marketplace.AuctionData', name: 'auctionData', type: 'tuple',
  }, { internalType: 'bytes', name: 'bidderSig', type: 'bytes' }, { internalType: 'bytes', name: 'ownerApprovedSig', type: 'bytes' }],
  name: 'finishAuction',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}];

const ERC721_ABI: AbiItem[] = [
  { inputs: [{ internalType: 'string', name: 'name_', type: 'string' }, { internalType: 'string', name: 'symbol_', type: 'string' }], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'owner', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'approved', type: 'address',
    }, {
      indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256',
    }],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'owner', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'operator', type: 'address',
    }, {
      indexed: false, internalType: 'bool', name: 'approved', type: 'bool',
    }],
    name: 'ApprovalForAll',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'from', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }, {
      indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256',
    }],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'approve', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'getApproved', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'operator', type: 'address' }], name: 'isApprovedForAll', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'mint', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'ownerOf', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'safeTransferFrom', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }, { internalType: 'bytes', name: 'data', type: 'bytes' }], name: 'safeTransferFrom', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'operator', type: 'address' }, { internalType: 'bool', name: 'approved', type: 'bool' }], name: 'setApprovalForAll', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }], name: 'supportsInterface', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }], name: 'tokenByIndex', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'uint256', name: 'index', type: 'uint256' }], name: 'tokenOfOwnerByIndex', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'tokenURI', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'tokenId', type: 'uint256' }], name: 'transferFrom', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
];

const ERC20_ABI: AbiItem[] = [
  { inputs: [{ internalType: 'string', name: 'name_', type: 'string' }, { internalType: 'string', name: 'symbol_', type: 'string' }], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'owner', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'spender', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
    }],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{
      indexed: true, internalType: 'address', name: 'from', type: 'address',
    }, {
      indexed: true, internalType: 'address', name: 'to', type: 'address',
    }, {
      indexed: false, internalType: 'uint256', name: 'value', type: 'uint256',
    }],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }, { internalType: 'address', name: 'spender', type: 'address' }], name: 'allowance', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }], name: 'balanceOf', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [], name: 'decimals', outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'subtractedValue', type: 'uint256' }], name: 'decreaseAllowance', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'spender', type: 'address' }, { internalType: 'uint256', name: 'addedValue', type: 'uint256' }], name: 'increaseAllowance', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'mint', outputs: [], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [], name: 'name', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [], name: 'symbol', outputs: [{ internalType: 'string', name: '', type: 'string' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [], name: 'totalSupply', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'transfer', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'from', type: 'address' }, { internalType: 'address', name: 'to', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'transferFrom', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function',
  },
];

const ERC20: Address = '0xbd65c58D6F46d5c682Bf2f36306D461e3561C747';
const ERC721: Address = '0xFCE9b92eC11680898c7FE57C4dDCea83AeabA3ff';

export {
  CONTRACT_ADDRESS, ABI, ERC721, ERC721_ABI, ERC20, ERC20_ABI,
};