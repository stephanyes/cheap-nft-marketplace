// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Import this file to use console.log
import "hardhat/console.sol";

contract Marketplace {
    using ECDSA for bytes32;

    struct AuctionData {
        address collectionAddress;
        address erc20Address;
        uint256 tokenId;
        uint256 bid;
    }

    function finishAuction(
        AuctionData memory auctionData,
        bytes memory bidderSig,
        bytes memory ownerApprovedSig
    ) public {
        bytes32 messagehash = keccak256(
            abi.encodePacked(
                auctionData.collectionAddress,
                auctionData.erc20Address,
                auctionData.tokenId,
                auctionData.bid
            )
        );
        address bidder = messagehash.toEthSignedMessageHash().recover(
            bidderSig
        );
        bytes32 hashedBidderSig = keccak256(bidderSig);
        address owner = hashedBidderSig.toEthSignedMessageHash().recover(
            ownerApprovedSig
        );

        IERC20(auctionData.erc20Address).transferFrom(
            bidder,
            owner,
            auctionData.bid
        );
        IERC721(auctionData.collectionAddress).safeTransferFrom(
            owner,
            bidder,
            auctionData.tokenId
        );
    }
}