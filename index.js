require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { contract } = require("./config/config");
const { limitPayloadSize, limit } = require("./utils/utils");
const routes = require("./routes/routes");
const redis = require('redis');
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // enable all cors request (Simple Usage)
app.use(limit);

// Setting req & res timeout to 1 minute
app.use((req, res, next) => {
  req.setTimeout(60000);
  res.setTimeout(60000);
  next();
});

// Create Users A & B
// fetchAndSetAccounts(web3, TOTAL_USERS);
console.log(`Contract address ${contract.options.address}`);

// Limit payload for security
app.use(limitPayloadSize);

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