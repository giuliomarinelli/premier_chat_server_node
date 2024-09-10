import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { MongoDbModule } from 'src/app_modules/mongo-db/mongo-db.module';



@Module({
    imports: [MongoDbModule],
    providers: [SessionService]
})
export class SessionManagerModule { }
