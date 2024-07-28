import { Injectable, NestMiddleware } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { FastifyRequest, FastifyReply } from 'fastify';


@Injectable()
export class RequestMiddleware implements NestMiddleware {
    use(req: FastifyRequest, res: FastifyReply, next: () => void) {
        (req as any)[REQUEST] = req;
        next();
    }
}