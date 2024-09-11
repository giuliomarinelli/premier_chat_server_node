import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './services/redis.service';


@Module({
  providers: [
    {
      provide: Redis,
      useFactory: async () => {
        return new Redis({
          host: 'localhost', // Usa il nome del container se stai usando Docker Compose
          port: 6379,
        });
      },
    },
    RedisService,
  ],
  exports: [Redis, RedisService], // Assicurati di esportare Redis e RedisService
})
export class RedisModule {}
