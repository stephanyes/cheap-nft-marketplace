const express = require("express");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const Web3 = require("web3").default;

const { validateBody } = require("./utils");
const { listNftSchema, placeBidSchema } = require("./schema");
const { ABI, CONTRACT_ADDRESS } = require("./contracts");
const NftController = require("./controller");

const web3 = new Web3(
  "https://sepolia.infura.io/v3/5d77802fcc8342b8b67c82df72c3f949"
);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
console.log(contract.options.address);

const PORT = 3000;
const limit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, // Limit to 100 req
  standardHeaders: true, // return RateLimit in headers
  legacyHeaders: false, // Disable X-RateLimit headers
});

const limitPayloadSize = (req, res, next) => {
  const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
  if (
    req.headers["content-length"] &&
    parseInt(req.headers["content-length"]) > MAX_PAYLOAD_SIZE
  ) {
    return res.status(413).json({ error: "Payload size exceeds the limit" });
  }
  next();
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // enable all cors request (Simple Usage)
app.use(limit);
app.use((req, res, next) => {
  req.setTimeout(5000);
  res.setTimeout(5000);
  next();
});

app.use(limitPayloadSize);

app.get("/api/listings", NftController.listings);

app.post(
  "/api/listings",
  validateBody(listNftSchema),
  NftController.createListing
);
app.post("/api/bids", validateBody(placeBidSchema), NftController.placeBid);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.keepAliveTimeout = 30 * 1000; // 30 sec
server.headersTimeout = 35 * 1000; // 35 sec
