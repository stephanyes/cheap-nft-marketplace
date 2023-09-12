/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

function validateBody(schema: Joi.Schema):
(req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    next();
  };
}

function validateQuery(schema: Joi.Schema):
(req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    next();
  };
}

export { validateBody, validateQuery };
