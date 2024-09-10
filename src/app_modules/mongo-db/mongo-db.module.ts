import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './Models/schema/session.schema';
import { SessionInformations, SessionInformationsSchema } from './Models/schema/session-information.schema';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Session.name, schema: SessionSchema },
            { name: SessionInformations.name, schema: SessionInformationsSchema }
        ])
    ],
    exports: [
        MongooseModule.forFeature([
            { name: Session.name, schema: SessionSchema },
            { name: SessionInformations.name, schema: SessionInformationsSchema }
        ])
    ]
})
export class MongoDbModule { }
