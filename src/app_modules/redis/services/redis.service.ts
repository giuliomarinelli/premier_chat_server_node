import { Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'

@Injectable()
export class RedisService {
  constructor(
    private readonly redisClient: Redis,
  ) { }

  // Cache methods
  public async setCache(key: string, value: string, expireSeconds?: number): Promise<'OK'> {
    if (expireSeconds) {
      return this.redisClient.set(key, value, 'EX', expireSeconds)
    }
    return this.redisClient.set(key, value)
  }

  public async getCache(key: string): Promise<string | null> {
    return this.redisClient.get(key)
  }

  public async deleteCache(key: string): Promise<number> {
    return this.redisClient.del(key)
  }

  // Persistence methods
  public async hsetHash(hash: string, key: string, value: string): Promise<number> {
    return this.redisClient.hset(hash, key, value)
  }

  public async hgetHash(hash: string, key: string): Promise<string | null> {
    return this.redisClient.hget(hash, key)
  }

  public async hdelHash(hash: string, key: string): Promise<number> {
    return this.redisClient.hdel(hash, key)
  }

  public async hgetallHash(hash: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(hash)
  }

}
