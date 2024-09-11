import { Module } from '@nestjs/common';
import Redis from "ioredis"

@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            useFactory: async () => {
                const redis = new Redis({
                    host: 'localhost',
                    port: 6379,
                    
                });
                return redis;
            },
        },
    ],
    exports: ['REDIS_CLIENT']
})
export class RedisModule { }
