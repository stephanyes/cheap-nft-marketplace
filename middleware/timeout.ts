import { Request, Response, NextFunction } from 'express';

export default function timeout(req: Request, res: Response, next: NextFunction): void {
  // Setting req & res timeout to 1 minute
  req.setTimeout(60000);
  res.setTimeout(60000);
  next();
}
