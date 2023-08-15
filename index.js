require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { limitPayloadSize, limit } = require("./middleware/limit");
const { timeout } = require('./middleware/timeout');
const { client } = require("./redis/redis")
const routes = require("./routes/routes");

const PORT = process.env.PORT || 3000;

client.connect().then(() => console.log("Connection finished")).catch((err) => console.err(err))
const app = express();

// Middlewares
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
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Server configs
server.keepAliveTimeout = 30 * 1000; // 30 sec
server.headersTimeout = 35 * 1000; // 35 sec