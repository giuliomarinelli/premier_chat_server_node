import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {

    private readonly logger = new Logger(RedisService.name);
    private readonly redisClient: Redis;

    constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {
        
        
       
        this.redisClient.on('error', (error) => {
            this.logger.error('Redis error:', error);
        });

        this.redisClient.on('connect', () => {
            this.logger.log('Redis connected');
        });

        this.redisClient.on('end', () => {
            this.logger.log('Redis connection closed');
        });
    }

    async set(key: string, value: string, expirationInSeconds?: number): Promise<void> {
        if (expirationInSeconds) {
            await this.redisClient.set(key, value, 'EX', expirationInSeconds);
        } else {
            await this.redisClient.set(key, value);
        }
    }

    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.redisClient.exists(key);
        return result === 1;
    }

    async quit(): Promise<void> {
        await this.redisClient.quit();
    }
}