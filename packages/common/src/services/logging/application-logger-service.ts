import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");
import {Injectable, Logger} from "@nestjs/common";

@Injectable()
export class ApplicationLoggerService extends Logger {

  private readonly logger: winston.Logger;

  constructor() {
    super();
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(o => `${o.timestamp} ${o.level} ${o.message}`)
      ),
      transports: [
        new winston.transports.Console({handleExceptions: true}),
        new DailyRotateFile({
          filename: "powerjudge-api-server",
          datePattern: "YYYY-MM-DD",
          dirname: "logs"
        })
      ],
      exitOnError: false
    });
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  info(message: string): void {
    this.logger.info(message);
  }

  error(message: string | Error): void {
    this.logger.error(<object>message);
    console.error(message);
  }

  critical(message: string): void {
    this.logger.crit(message);
  }
}
