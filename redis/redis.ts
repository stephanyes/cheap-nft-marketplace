/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-mutable-exports */
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
import { PinoLogger } from '../logger/pino.ts';

const useTLS = process.env.REDIS_TLS_FLAG === 'true';
const redisURL = useTLS ? process.env.REDIS_URL_TLS : `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const cacheOptions = {
  url: redisURL,
  ...(useTLS && { socket: { tls: true } }), // Add the socket option if useTLS is true
};

let redisClient: RedisClientType | null = null;

type EventCallback = (...args: any[]) => string;

const eventMessageMap: Record<string, EventCallback> = {
  error: (err: any) => `Redis Error: ${err}`,
  connect: () => 'Redis connected',
  reconnecting: () => 'Redis reconnecting',
  ready: () => 'Redis ready!',
};

// TODO
// function attachRedisEventListeners(client: RedisClientType) {
//   for (const [event, getMessage] of Object.entries(eventMessageMap)) {
//     client.on(event as any, (...args: any[]) => PinoLogger.info(getMessage(...args)));
//   }
// }

function attachRedisEventListeners(client: RedisClientType) {
  Object.entries(eventMessageMap).forEach(([event, getMessage]) => {
    client.on(event as any, (...args: any[]) => PinoLogger.info(getMessage(...args)));
  });
}

async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient(cacheOptions);
    attachRedisEventListeners(redisClient);
    await redisClient.connect();
  }
  return redisClient;
}

interface Listing {
  id: string;
}

export async function storeListing(listing: Listing): Promise<void> {
  const client = await getRedisClient();
  try {
    const key = `listing:${listing.id}`;
    const value = JSON.stringify(listing);
    await client.set(key, value);
    PinoLogger.info(`Stored listing with key ${key}`);
  } catch (error) {
    PinoLogger.error(`Failed to store listing: ${error}`);
  }
}

export async function getListingById(id: string): Promise<Listing | []> {
  const client = await getRedisClient();
  try {
    const key = `listing:${id}`;
    const listing = await client.get(key);

    if (!listing) {
      return [];
    }

    return JSON.parse(listing);
  } catch (error) {
    PinoLogger.error(`Failed to get listing by id: ${error}`);
    throw error;
  }
}

export async function getAllListings(): Promise<Listing[]> {
  const client = await getRedisClient();
  try {
    // Note: This can be problematic with large datasets.
    const keys: string[] = await client.keys('listing:*');
    const valuesPromises: Promise<string | null>[] = keys.map((key) => client.get(key));
    const values: (string | null)[] = await Promise.all(valuesPromises);
    return values
      .filter((value) => value !== null) // Filter out null values
      .map((valueString) => JSON.parse(valueString as string)); // No nulls present
  } catch (error) {
    PinoLogger.error(`Failed to get all listings: ${error}`);
    throw error;
  }
}
export { getRedisClient, redisClient };
