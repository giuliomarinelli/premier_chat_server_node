/* eslint-disable @typescript-eslint/no-unused-vars */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SecurityUtils } from './app_modules/auth/services/security-utils';
import runner from './runners/runner';
import fastifyCookie from '@fastify/cookie';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { JwtUtils } from './app_modules/auth/services/jwt-utils';
import { HttpExceptionFilter } from './exception_handling/http-exception-filter';



(async () => {
  const logger = new Logger("Bootstrap")
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )
  const configService = app.get<ConfigService>(ConfigService)
  app.enableCors({
    origin: configService.get<string[]>("App.corsOrigins"),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  })
  app.useGlobalFilters(new HttpExceptionFilter())
  const securityUtils = app.get<SecurityUtils>(SecurityUtils)
  const jwtUtils = app.get<JwtUtils>(JwtUtils)
  const port = configService.get<number>("App.port")
  await app.register(fastifyCookie as unknown as Parameters<NestFastifyApplication['register']>[0], {
    secret: configService.get<string>("SecurityCookie.secret")
  });
  await runner(securityUtils)
  await app.listen(port);
  logger.log(`Fastify listening on port ${port}`)
})()

