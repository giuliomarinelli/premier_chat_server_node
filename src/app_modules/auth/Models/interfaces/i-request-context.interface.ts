import { FastifyRequest } from 'fastify';

export interface IRequestContext {
  req: FastifyRequest;
}