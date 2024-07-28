import { join } from "path"

export class FileLoggerConfig {

    private static exceptionFileLoggerPath = join(__dirname, '..', '..', 'exception_logs.log')

    public static get getExceptionFileLoggerPath(): string {
        return this.exceptionFileLoggerPath
    }

}