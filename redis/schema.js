import { Entity, Schema, Repository } from 'redis-om';



class NFT extends Entity {}


const NFTSchema = new Schema(NFT, {
    id: { type: "string"},
    sellerAddress: { type: 'string' },
    buyerAddress: { type: 'string'},
    price: { type: "string"},
    tokenId: { type: 'string' },
    erc20Address: { type: 'string'},
    collectionAddress: { type: "number"},
    sold: { type: 'boolean' },
    isAuction: { type: 'boolean'}, 
})







