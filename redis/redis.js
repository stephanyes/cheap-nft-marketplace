const redis = require('redis');
let client;

(async () => {
  client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

  client.on("error", (error) => console.error(`Error : ${error}`));
  client.on('connect', () => {
    console.log('Connecting...');
  });
})();

async function storeListing(listing) {
    const key = `listing:${listing.id}`;
    const value = JSON.stringify(listing);
    await client.set(key, value);
    console.log(`Listing with key ${key} - value ${value}`);
}

async function getListingById(id) {
    const key = `listing:${id}`;
    const listing = await client.get(key)
    return JSON.parse(listing);
}

async function getAllListings() {
    const keys = await client.keys('*');
    const valuesPromises = keys.map(key => client.get(key));
    const values = await Promise.all(valuesPromises);
    const objectsArray = values.map(valueString => JSON.parse(valueString))
    return objectsArray;
}

module.exports = {
    client,
    storeListing,
    getListingById,
    getAllListings
};