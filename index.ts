/* eslint-disable max-len */
require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import { getCache } from './redis/redis';
import express from 'express';
import cors from 'cors';
// const pinoHttp = require('pino-http');
import routes from './routes/routes';
import logger from './pino/pino';
import { limitPayloadSize, limit } from './middleware/limit';
import { timeout } from './middleware/timeout';
import { contract } from './config/config';

const PORT = process.env.PORT || 3000;

const app = express();

async function bootstrap() {
    await getCache();
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
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
    });

    // Server
    const server = app.listen(PORT, () => {
    logger.info(`Server running on port: ${PORT}`);
    logger.info(`NFT Marketplace address: ${contract.options.address}`);
    });

    // Server configs
    server.keepAliveTimeout = 30 * 1000; // 30 sec
    server.headersTimeout = 35 * 1000; // 35 sec
}


bootstrap().catch(error => {
    logger.error('Failed to start server:', error);
});