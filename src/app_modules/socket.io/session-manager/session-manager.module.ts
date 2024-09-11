import { Module } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './Models/schema/session.schema';
import { SessionInformations, SessionInformationsSchema } from './Models/schema/session-information.schema';




@Module({
    imports: [MongooseModule.forFeature([
        { name: Session.name, schema: SessionSchema },
        { name: SessionInformations.name, schema: SessionInformationsSchema },
      ])],
    providers: [SessionService]
})
export class SessionManagerModule { }
