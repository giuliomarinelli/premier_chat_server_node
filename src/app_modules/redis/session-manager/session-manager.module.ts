import { Module } from '@nestjs/common';
import { RedisModule } from 'src/app_modules/redis/redis.module';
import { SessionService } from './services/session.service';


@Module({
  imports: [RedisModule], // Importa il RedisModule qui
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionManagerModule {}