import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Session } from 'src/app_modules/mongo-db/Models/schema/session.schema';
import { SessionInformations } from 'src/app_modules/mongo-db/Models/schema/session-information.schema';



@Injectable()
export class SessionService {

    private readonly sessionModel!: Model<Session>;
    private readonly sessionInformationsModel!: Model<SessionInformations>;

    constructor(@InjectConnection() private readonly connection: Connection) {
        this.sessionModel = this.connection.model(Session.name);
        this.sessionInformationsModel = this.connection.model(SessionInformations.name);
    }

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
