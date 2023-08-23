/* eslint-disable import/prefer-default-export */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import pino from 'pino';
import { ILogger } from './loggerInterface';

const pinoInstance = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: process.env.PINO_PRINT,
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const PinoLogger: ILogger = {
  info: (message, ...meta) => pinoInstance.info(message, ...meta),
  error: (message, ...meta) => pinoInstance.error(message, ...meta),
};
