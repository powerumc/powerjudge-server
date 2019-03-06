import {createDecorator, register} from "../../decorators";
import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

@register().isSingleton()
export class ApplicationLogger {

    private readonly logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(o => `${o.timestamp} ${o.level} ${o.message}`)
            ),
            transports: [
                new winston.transports.Console({ handleExceptions: true }),
                new DailyRotateFile({
                    datePattern: "YYYY-MM-DD",
                    dirname: "logs"
                })
            ],
            exitOnError: false
        });
    }

    getInstance(): winston.Logger {
        return this.logger;
    }
}

export const IApplicationLogger = createDecorator(ApplicationLogger);