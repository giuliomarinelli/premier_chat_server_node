import { Module } from '@nestjs/common';
import { WsGateway } from './ws-gateway';
import { ClientService } from './services/client.service';
import { RedisService } from '../redis/services/redis.service';
import { RedisModule } from '../redis/redis.module';


@Module({

    providers: [WsGateway, ClientService, RedisService],

    imports: [RedisModule]

})
export class SocketIoModule {}
