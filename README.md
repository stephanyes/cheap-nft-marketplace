# Ratherlabs

## Cheap NFT Marketplace

An **_NFT marketplace_** is a platform where NFT holders can safely publish their tokens for sale and have investors bid and purchase them. This solves a key issue for NFT traders - the challenge of determining who should initiate the transaction. Traditionally, NFT traders have faced the dilemma of who should send their asset to the counterparty first and wait for the other party to send theirs.

Whilst some NFT marketplaces focus mostly on user experience, and sacrifice security or decentralization in order to ease the process, others focus mostly on reducing transaction fees and preventing multiple transactions, these NFT marketplaces often use techniques that are not user friendly. Most of these use cases rely on a backend or off-chain system that complements smart-contracts to facilitate transactions.

In this case, we will use an existing smart-contract deployed on the Sepolia network that enable two users to securely settle their trades with each other in a decentralized way, using a single transaction. The smart-contract certifies both the cryptographic signature of the **_SELLER_** and the **_BUYER_**, allowing for a secure settlement. The smart-contract essentially allows **_SELLER_** to transfer any of their **_NFT token_** to **_BUYER_** in exchange for any **_ERC20 token_**.

You are tasked with building a simple backend server that stores an in-memory list of listings, and serves those listings through a **_REST API_**, and assists users in connecting, agreeing on terms through bidding to then settle their trade securely using the Settler contract.

## Resources

For the sake of simplicity, we already deployed all smart-contracts necessary to complete this.
All contracts are verified in Sepolia explorer, so you should be able to inspect their code and learn how they work to reverse engineer it.

- [Settler Contract](https://sepolia.etherscan.io/address/0x597c9bc3f00a4df00f85e9334628f6cdf03a1184#code): Anyone can use this contract to settle their trade
- [MockERC20](https://sepolia.etherscan.io/address/0xbd65c58d6f46d5c682bf2f36306d461e3561c747#code): You can mint yourself any amount for testing
- [MockERC721](https://sepolia.etherscan.io/address/0xfce9b92ec11680898c7fe57c4ddcea83aeaba3ff#code): You can mint yourself any token for testing
- [Sepolia Network tools](https://sepolia.dev/)

## Bare Minimum Requirements

- REST API to allow users to list their NFTs with fixed price or as an auction
- REST API to allow users to place bids on auctions or to purchase a token
- Use Postman to simulate User A & User B
- Once users agree on terms through the APIs, send the transaction from the backend to settle the trade (calling **_finishAuction(...args)_**)

## Bonus / Improvements

To stand out, feel free to add as much functionalities and capabilities as you like.

## Evaluation

- 100% bare minimum requirements completion
- Aesthetic code, clean code (use linter)
- Elegant and simpler solution
- Senseful folder structure
- Scalable solution
