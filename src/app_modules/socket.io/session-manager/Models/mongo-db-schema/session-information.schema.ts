import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ISessionInformations } from "../interfaces/session-informations.interface";

@Schema()
export class SessionInformations implements ISessionInformations {

    @Prop({ required: true })
    platform: string;

    @Prop({ required: true })
    browserName: string;

    @Prop({ required: true })
    browserVersion: string;

    @Prop({ required: true })
    language: string;

    @Prop({ required: true })
    timezone: string;
}

export const SessionInformationsSchema = SchemaFactory.createForClass(SessionInformations);