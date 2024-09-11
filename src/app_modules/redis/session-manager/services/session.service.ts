import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/app_modules/redis/services/redis.service';
import { ISession } from '../Models/interfaces/session.interface';


@Injectable()
export class SessionService {
  private readonly SESSION_TTL = 3600; // 1 hour in seconds

  constructor(private readonly redisService: RedisService) {}

  async saveSession(sessionId: string, session: ISession): Promise<void> {
    if (session.restore) {
      // Persist session in hash
      await this.redisService.hsetHash('sessions', sessionId, JSON.stringify(session));
    } else {
      // Cache session with TTL
      await this.redisService.setCache(sessionId, JSON.stringify(session), this.SESSION_TTL);
    }
  }

  async getSession(sessionId: string): Promise<ISession | null> {
    const cachedSession = await this.redisService.getCache(sessionId);
    if (cachedSession) {
      return JSON.parse(cachedSession);
    }

    const persistentSession = await this.redisService.hgetHash('sessions', sessionId);
    if (persistentSession) {
      return JSON.parse(persistentSession);
    }

    return null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    // Remove from cache
    await this.redisService.deleteCache(sessionId);

    // Remove from persistent storage
    await this.redisService.hdelHash('sessions', sessionId);
  }
}
