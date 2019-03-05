import {createDecorator, register} from "../../decorators";
import * as winston from "winston";

interface IApplicationLogger {
    getInstance(): winston.Logger;
}

export const IApplicationLogger = createDecorator('applicationLogger');

@register().hasInterface(IApplicationLogger).isSingleton()
export class ApplicationLogger implements IApplicationLogger{

    private readonly logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({ handleExceptions: true })
            ],
            exitOnError: false
        });
    }

    getInstance(): winston.Logger {
        return this.logger;
    }
}