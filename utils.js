const rateLimit = require("express-rate-limit");

// Ethereum addresses
let accounts = null;

function validateBody(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    next();
  };
}

function limitPayloadSize(req, res, next) {
  const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
  if (
    req.headers["content-length"] &&
    parseInt(req.headers["content-length"]) > MAX_PAYLOAD_SIZE
  ) {
    return res.status(413).json({ error: "Payload size exceeds the limit" });
  }
  next();
}

const limit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, // Limit to 100 req
  standardHeaders: true, // return RateLimit in headers
  legacyHeaders: false, // Disable X-RateLimit headers
});

const createAccounts = async (web3Instance, total) => {
  const accounts = [];
  for (let i = 0; i < total; i++) {
    const account = await web3Instance.eth.accounts.create();
    accounts.push(account);
  }
  return accounts;
};

async function fetchAndSetAccounts(web3Instance, total) {
  try {
    accounts = await createAccounts(web3Instance, total);
  } catch (error) {
    console.error("Error creating accounts:", error);
  }
}

function getAccounts() {
  return accounts;
}

module.exports = {
  validateBody,
  limitPayloadSize,
  limit,
  createAccounts,
  fetchAndSetAccounts,
  getAccounts,
};
