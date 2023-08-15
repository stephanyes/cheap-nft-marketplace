const redis = require('redis');
const { promisify } = require("util");
let client, hGetAllAsync, keysAsync;

(async () => {
  client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

  client.on("error", (error) => console.error(`Error : ${error}`));
  client.on('connect', () => {
    console.log('Connected to Redis');
  });
//   await client.connect();
  hGetAllAsync = promisify(client.hGetAll).bind(client);
  keysAsync = promisify(client.keys).bind(client);
})();

async function storeListing(listing) {
    const key = `listing:${listing.id}`;
    const value = JSON.stringify(listing);
    await client.set(key, value, redis.print);
    // console.log("asdasd::" , await client.get(key))
    console.log("listing stored")
}

function getListing(id, callback) {
    const key = `listing:${id}`;
    client.get(key, (err, result) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, JSON.parse(result));
    });
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
    getListing,
    getAllListings
};