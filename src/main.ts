import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SecurityUtilsService } from './app_modules/auth/services/security-utils.service';
import runner from './runners/runner';

(async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  )
  const securityUtils = app.get<SecurityUtilsService>(SecurityUtilsService)
  runner(securityUtils)
  await app.listen(3000);
})()

