import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/app_modules/redis/services/redis.service';
import { ISession } from '../Models/interfaces/session.interface';


@Injectable()
export class SessionService {
  
  private readonly SESSION_TTL = 3600; // 1 hour in seconds

  constructor(private readonly redisService: RedisService) { }

  public async saveCacheSession(sessionId: string, session: ISession, ttl?: number): Promise<void> {
    const expiration = ttl || this.SESSION_TTL;
    await this.redisService.setCache(sessionId, JSON.stringify(session), expiration);
  }
  
  public async savePersistentSession(sessionId: string, session: ISession): Promise<void> {
    await this.redisService.hsetHash('sessions', sessionId, JSON.stringify(session));
  }
  
  public validateSession(session: ISession): boolean {
    // Controlla se tutte le proprietà necessarie sono presenti e corrette
    return !!session.id && !!session.userId;
  }

  public async getSession(sessionId: string): Promise<ISession | null> {
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

  public async deleteSession(sessionId: string): Promise<void> {
    // Remove from cache
    await this.redisService.deleteCache(sessionId);

    // Remove from persistent storage
    await this.redisService.hdelHash('sessions', sessionId);
  }
}
