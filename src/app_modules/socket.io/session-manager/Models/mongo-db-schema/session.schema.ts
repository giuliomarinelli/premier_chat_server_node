import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ISession } from '../interfaces/session.interface'

@Schema()
export class Session implements ISession {

    @Prop({ required: true })
    userId: string; // Può essere un ObjectId in MongoDB

    @Prop({ required: true })
    restore: boolean;

    @Prop({ required: true })
    fingerprint: string; // SHA-256 hash in formato esadecimale

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop()
    expiresAt?: Date;

    @Prop()
    lastAccessedAt?: Date;

    @Prop()
    ipAddress?: string;

    @Prop({ type: SessionInformationsSchema, required: true })
    informations: SessionInformations;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
