import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from 'src/app_modules/mongo-db/Models/schema/session.schema';
import { SessionInformations } from 'src/app_modules/mongo-db/Models/schema/session-information.schema';



@Injectable()
export class SessionService {

    constructor(
        @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
        @InjectModel(SessionInformations.name) private readonly sessionInformationsModel: Model<SessionInformations>
    ) {}

    public async createSession(
        userId: string,
        restore: boolean,
        valid: boolean,
        fingerprint: string,
        expiresAt: number,
        lastAccessedAt: number,
        ipAddress: string,
        platform: string,
        browserName: string,
        browserVersion: string,
        language: string,
        timezone: string
    ): Promise<Session> {
        
        const sessionInformations = new this.sessionInformationsModel({
            platform,
            browserName,
            browserVersion,
            language,
            timezone
        });

        const newSession = new this.sessionModel({
            userId,
            restore,
            valid,
            fingerprint,
            createdAt: Date.now(),
            expiresAt,
            lastAccessedAt,
            ipAddress,
            informations: sessionInformations
        });

        return newSession.save();
    }

}
