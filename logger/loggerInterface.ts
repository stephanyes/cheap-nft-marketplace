/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ILogger {
    info(message: string, ...meta: any[]): void;
    error(message: any, ...meta: any[]): void;
  }
