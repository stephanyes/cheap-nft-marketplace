/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable max-len */
require('dotenv').config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import { getRedisClient } from './redis/redis.ts';
// const pinoHttp = require('pino-http');
import routes from './routes/routes.ts';
import { PinoLogger } from './logger/pino.ts';
import { limitPayloadSize, limit } from './middleware/limit.ts';
import timeout from './middleware/timeout.ts';
import { contract } from './config/config.ts';

// import 'dotenv/config';

const PORT = process.env.PORT || 3000;

const app = express();

async function bootstrap() {
  await getRedisClient();
  // Middlewares
  // app.use(pinoHttp({ logger })); // No reason behind adding this, just to simply log what the request looks like and the response structure.
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors()); // enable all cors request (Simple Usage)
  app.use(limit);
  app.use(timeout);
  app.use(limitPayloadSize); // Limit payload for security

  // Routes
  app.use(routes);

  // Error handling
  app.use((err: Error, req: Request, res: Response) => {
    PinoLogger.error(err.stack);
    res.status(500).send('Something broke!');
  });

  // Server
  const server = app.listen(PORT, () => {
    PinoLogger.info(`Server running on port: ${PORT}`);
    PinoLogger.info(`NFT Marketplace address: ${contract.options.address}`);
  });

  // Server configs
  server.keepAliveTimeout = 30 * 1000; // 30 sec
  server.headersTimeout = 35 * 1000; // 35 sec
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
bootstrap().catch((error: any) => {
  if (error.code === 'ERR_INVALID_URL') {
    PinoLogger.error(`Caught an invalid URL error: ${error.input}`);
  } else {
    PinoLogger.error(`Caught an unexpected error: ${error.message}`);
  }
});
