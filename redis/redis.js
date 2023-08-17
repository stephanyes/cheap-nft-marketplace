const redis = require('redis');
const logger = require('../pino/pino');

let client;

(async () => {
  try {
    client = redis.createClient({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    });

    client.on('error', (error) => logger.error(`Redis Error : ${error}`));
    client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  } catch (error) {
    logger.error(`Failed to connect to Redis: ${error}`);
  }
})();

async function storeListing(listing) {
  try {
    const key = `listing:${listing.id}`;
    const value = JSON.stringify(listing);
    await client.set(key, value);
    logger.info(`Stored listing with key ${key}`);
  } catch (error) {
    logger.error(`Failed to store listing: ${error}`);
  }
}

async function getListingById(id) {
  try {
    const key = `listing:${id}`;
    const listing = await client.get(key);

    if (!listing) {
      return [];
    }

    return JSON.parse(listing);
  } catch (error) {
    logger.error(`Failed to get listing by id: ${error}`);
    throw error;
  }
}

async function getAllListings() {
  try {
    // Note: This can be problematic with large datasets.
    const keys = await client.keys('listing:*');
    const valuesPromises = keys.map((key) => client.get(key));
    const values = await Promise.all(valuesPromises);
    return values.map((valueString) => JSON.parse(valueString));
  } catch (error) {
    logger.error(`Failed to get all listings: ${error}`);
    throw error;
  }
}

module.exports = {
  client,
  storeListing,
  getListingById,
  getAllListings,
};
