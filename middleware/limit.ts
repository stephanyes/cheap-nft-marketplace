import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

function limitPayloadSize(req: Request, res: Response, next: NextFunction): void {
  const MAX_PAYLOAD_SIZE = 1024 * 1024; // 1MB
  if (req.headers['content-length'] && parseInt(req.headers['content-length'], 10) > MAX_PAYLOAD_SIZE) {
    res.status(413).json({ error: 'Payload size exceeds the limit' });
    return;
  }
  next();
}

const limit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, // Limit to 100 req
  standardHeaders: true, // return RateLimit in headers
  legacyHeaders: false, // Disable X-RateLimit headers
});

export { limitPayloadSize, limit };
