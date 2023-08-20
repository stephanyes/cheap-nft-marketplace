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
});

export const PinoLogger: ILogger = {
  info: (message, ...meta) => pinoInstance.info(message, ...meta),
  error: (message, ...meta) => pinoInstance.error(message, ...meta),
};
