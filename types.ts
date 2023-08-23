/* eslint-disable @typescript-eslint/no-explicit-any */
import Web3 from 'web3';
import { BN } from './config/config.ts';
import { Address } from './contracts/contracts.ts';

export interface TransactionOptions {
    web3: Web3;
    nonce: string;
    from: string;
    to: string;
    data: string;
    gasEstimate: typeof BN;
    gasPrice: typeof BN;
    maxGasLimit: typeof BN;
}

export interface TransactionObject {
    from: string;
    to?: string;
    value?: string;
    gas?: number;
    gasPrice?: string;
    data?: string;
    nonce?: string;
    chainId?: number;
}

export interface EventLog {
    event: string;
    address: string;
    returnValues: any;
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    raw?: {data: string; topics: any[]};
}

export interface Log {
    address: string;
    data: string;
    topics: string[];
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    removed: boolean;
}

export interface TransactionReceipt {
    status: boolean;
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    contractAddress?: string;
    cumulativeGasUsed: number;
    gasUsed: number;
    effectiveGasPrice: number;
    logs: Log[];
    logsBloom: string;
    events?: {
        [eventName: string]: EventLog;
    };
}

export interface SignedTransaction {
    raw: string;
    rawTransaction: string;
}

export interface IListing {
    id: number;
    sellerAddress: string;
    isAuction: boolean;
    price: string;
    tokenId: string;
    erc20Address: string;
    collectionAddress: string;
    buyerAddress?: string;
    status?: 'sold' | 'active';
}

export interface CreateListingParams {
    sellerAddress: Address;
    collectionAddress: Address;
    isAuction: boolean;
    price: string;
    tokenId: string;
    erc20Address: Address;
}

export interface PlaceBidParams {
    buyerAddress: string;
    tokenId: string;
    bidAmount: string;
}

export interface MintTokenParams {
    fromAddress: Address;
    privateKey: string;
    toAddress: Address;
    amount: string;
    token: 'ERC20' | 'ERC721';
}

export interface AuctionData {
    collectionAddress: Address;
    erc20Address: Address;
    tokenId: string;
    bid: string;
    privateKey: string;
    offerSignedMessage: string;
}

export interface SignData {
    dataString: string;
    privateKey: string;
}

export interface ListingObj {
    tokenId: string
    bid: string;
    collectionAddress: string;
    erc20Address: string;
    privateKey: string;
}

export interface FinishAuctionParams {
    senderAccount: Address;
    bidderSig: string;
    ownerApprovedSig: string;
    bidderAddress: Address;
    privateKeyA: string;
    privateKeyB: string;
    obj: ListingObj;
}
