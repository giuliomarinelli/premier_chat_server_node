import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { FinalErrorRes } from "./Models/final-error-res";
import { FirstErrorRes } from "./Models/first-error-res";
import { HttpExceptionLogger } from "src/file-logger/http-exception-logger";
import { FileLoggerConfig } from "src/file-logger/file-logger-config";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    public catch(e: Error, host: ArgumentsHost): void {
        const req = host.switchToHttp().getRequest<FastifyRequest>();
        const res = host.switchToHttp().getResponse<FastifyReply>();

        const httpExceptionLogger = HttpExceptionLogger
            .getLogger(FileLoggerConfig.getExceptionFileLoggerPath, "HttpExceptions")

        let finalErrorRes: FinalErrorRes;

        if (e instanceof HttpException) {

            const firstErrorRes: FirstErrorRes = <FirstErrorRes>e.getResponse()

            finalErrorRes = {
                ...firstErrorRes,
                path: req.url,
                requestId: req.id,
                timestamp: new Date().toISOString(),
            };

            httpExceptionLogger.error(JSON.stringify(finalErrorRes))

            res.status(e.getStatus()).send(finalErrorRes);
        } else {
            this.logger.error('Unexpected error', e.stack);

            finalErrorRes = {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                error: "Internal Server Error",
                message: e.message,
                path: req.url,
                timestamp: new Date().toISOString(),
                requestId: req.id,
            };

            httpExceptionLogger.error(JSON.stringify(finalErrorRes))

            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(finalErrorRes);
        }
    }
}
