import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ISession } from "../interfaces/session.interface";
import { SessionInformationsSchema } from "./session-information.schema";
import { ISessionInformations } from "../interfaces/session-informations.interface";

@Schema()
export class Session implements ISession {

    @Prop({ required: true })
    userId: string // Può essere un ObjectId in MongoDB

    @Prop({ required: true })
    restore: boolean

    @Prop({ required: true })
    valid: boolean

    @Prop({ required: true })
    fingerprint: string // SHA-256 hash in formato esadecimale

    @Prop({ default: Date.now() })
    createdAt: number

    @Prop({ required: true })
    expiresAt: number

    @Prop({ required: true })
    lastAccessedAt: number

    @Prop({ required: true })
    ipAddress: string

    @Prop({ type: SessionInformationsSchema, required: true })
    informations: ISessionInformations
}

export const SessionSchema = SchemaFactory.createForClass(Session);