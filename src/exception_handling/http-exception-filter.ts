import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { FinalErrorRes } from "./Models/final-error-res";
import { FirstErrorRes } from "./Models/first-error-res";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

    public catch(e: HttpException, host: ArgumentsHost): void {

        const req = host.switchToHttp().getRequest<FastifyRequest>()
        const res = host.switchToHttp().getResponse<FastifyReply>()

        const firstErrorRes: FirstErrorRes = <FirstErrorRes>e.getResponse()

        const finalErrorRes: FinalErrorRes = {

            ...firstErrorRes,
            path: req.url,
            requestId: req.id,
            timestamp: new Date().toISOString(),

        }

        res.status(e.getStatus()).send(finalErrorRes)

    }




}