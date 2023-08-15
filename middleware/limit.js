const rateLimit = require("express-rate-limit");
function limitPayloadSize(req, res, next) {
    const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
    if (req.headers["content-length"] && parseInt(req.headers["content-length"]) > MAX_PAYLOAD_SIZE) {
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

  module.exports = {
    limitPayloadSize,
    limit
  }