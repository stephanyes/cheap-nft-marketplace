require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pinoHttp = require('pino-http');
const { limitPayloadSize, limit } = require("./middleware/limit");
const { timeout } = require('./middleware/timeout');
const { client } = require("./redis/redis")
const routes = require("./routes/routes");
const logger = require("./pino/pino")
const { contract } = require("./config/config")

const PORT = process.env.PORT || 3000;

client.connect().then(() => logger.info("Connection to Redis finished :)")).catch((err) => logger.error(err))
const app = express();

// Middlewares
app.use(pinoHttp({ logger })); // No reason behind adding this, just to simply log what the request looks like and the response structure.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // enable all cors request (Simple Usage)
app.use(limit);
app.use(timeout);
app.use(limitPayloadSize); // Limit payload for security

// Routes
app.use(routes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port: ${PORT}`);
  logger.info(`NFT Marketplace address: ${contract.options.address}`);
});

// Server configs
server.keepAliveTimeout = 30 * 1000; // 30 sec
server.headersTimeout = 35 * 1000; // 35 sec