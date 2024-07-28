import { Logger, LoggerService } from "@nestjs/common";
import { appendFile } from "fs";


export class HttpExceptionLogger extends Logger implements LoggerService {

    private logFilePath: string

    private static logger: HttpExceptionLogger | undefined

    private constructor(logFilePath: string, context: string) {
        super(context)
        this.logFilePath = logFilePath
    }

    public static getLogger(logFilePath?: string, context?: string): HttpExceptionLogger {

        if (this.logger) {
            return this.logger
        } else if (logFilePath && context) {
            this.logger = new HttpExceptionLogger(logFilePath, context)
            console.log(this.logger.logFilePath, this.logger.context)
            return this.logger
        }
    }

    private writeLogToFile(message: string): void {
        appendFile(this.logFilePath, `${message}\n`, (err) => {
            if (err) new Logger(this.context).error(err)
        })
    }

    public log(message: string) {
        super.log(message);
        this.writeLogToFile(message);
    }

    public error(message: string, trace?: string) {
        super.error(message, trace);
        this.writeLogToFile(message);
        if (trace) {
            this.writeLogToFile(trace);
        }
    }

    public warn(message: string) {
        super.warn(message);
        this.writeLogToFile(message);
    }

    public debug(message: string) {
        super.debug(message);
        this.writeLogToFile(message);
    }

    public verbose(message: string) {
        super.verbose(message);
        this.writeLogToFile(message);
    }



}
