import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';


@Injectable()
export class SessionService {

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
