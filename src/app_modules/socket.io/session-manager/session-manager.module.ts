import { Module, Session } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from './Models/mongo-db-schema/session.schema';
import { SessionInformations, SessionInformationsSchema } from './Models/mongo-db-schema/session-information.schema';


@Module({
    imports: [MongooseModule.forFeature([
        {
            name: Session.name,
            schema: SessionSchema
        },
        {
            name: SessionInformations.name,
            schema: SessionInformationsSchema
        }
    ])]
})
export class SessionManagerModule { }
