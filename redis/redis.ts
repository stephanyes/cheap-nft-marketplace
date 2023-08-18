import type { RedisClientType } from 'redis'
import { createClient } from 'redis'
// import { config } from '@app/config'
import logger from '../pino/pino';

const config = {
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  urlTls: process.env.REDIS_URL_TLS || '',
  tlsFlag: process.env.REDIS_TLS_FLAG === 'true'
}
let redisClient: RedisClientType | null = null;

const cacheOptions = {
  url: config.tlsFlag ? config.urlTls : config.url,
};

if (config.tlsFlag) {
  Object.assign(cacheOptions, {
    socket: {
      tls: false,
    },
  });
}

async function getCache(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({
      ...cacheOptions,
    });
    redisClient.on('error', err => logger.error(`Redis Error: ${err}`));
    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('reconnecting', () => logger.info('Redis reconnecting'));
    redisClient.on('ready', () => logger.info('Redis ready!'));
    await redisClient.connect();
  }
  return redisClient;
}



interface Listing {
  id: string;
}


            
export async function storeListing(listing: Listing): Promise<void> {
  const client = await getCache();
  try {
    const key = `listing:${listing.id}`;
    const value = JSON.stringify(listing);
    await client.set(key, value);
    logger.info(`Stored listing with key ${key}`);
  } catch (error) {
    logger.error(`Failed to store listing: ${error}`);
  }
}

export async function getListingById(id: string): Promise<Listing | []> {
  const client = await getCache();
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

export async function getAllListings(): Promise<Listing[]> {
  const client = await getCache();
  try {
    // Note: This can be problematic with large datasets.
    const keys: string[] = await client.keys('listing:*');
    const valuesPromises: Promise<string | null>[] = keys.map((key) => client.get(key));
    const values: (string | null)[] = await Promise.all(valuesPromises);
    return values
    .filter(value => value !== null) // Filter out null values
    .map((valueString) => JSON.parse(valueString as string)); // No nulls present
  } catch (error) {
    logger.error(`Failed to get all listings: ${error}`);
    throw error;
  }
}
export { getCache, redisClient };

