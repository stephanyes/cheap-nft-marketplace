# Ratherlabs

## Cheap NFT Marketplace

An **_NFT marketplace_** is a platform where NFT holders can safely publish their tokens for sale and have investors bid and purchase them. This solves a key issue for NFT traders - the challenge of determining who should initiate the transaction. Traditionally, NFT traders have faced the dilemma of who should send their asset to the counterparty first and wait for the other party to send theirs.

Whilst some NFT marketplaces focus mostly on user experience, and sacrifice security or decentralization in order to ease the process, others focus mostly on reducing transaction fees and preventing multiple transactions, these NFT marketplaces often use techniques that are not user friendly. Most of these use cases rely on a backend or off-chain system that complements smart-contracts to facilitate transactions.

In this case, we will use an existing smart-contract deployed on the Sepolia network that enable two users to securely settle their trades with each other in a decentralized way, using a single transaction. The smart-contract certifies both the cryptographic signature of the **_SELLER_** and the **_BUYER_**, allowing for a secure settlement. The smart-contract essentially allows **_SELLER_** to transfer any of their **_NFT token_** to **_BUYER_** in exchange for any **_ERC20 token_**.

You are tasked with building a simple backend server that stores an in-memory list of listings, and serves those listings through a **_REST API_**, and assists users in connecting, agreeing on terms through bidding to then settle their trade securely using the Settler contract.
