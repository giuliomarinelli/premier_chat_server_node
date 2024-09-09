import { Module } from '@nestjs/common';
import { WsGateway } from './ws-gateway';
import { SessionManagerModule } from './session-manager/session-manager.module';

@Module({

    providers: [WsGateway],

    imports: [SessionManagerModule]

})
export class SocketIoModule {}
