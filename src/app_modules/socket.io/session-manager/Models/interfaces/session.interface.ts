import { ISessionInformations } from "./session-informations.interface";

export interface ISession {

    userId: string
    restore: boolean
    valid: boolean
    fingerprint: string
    createdAt: number
    expiresAt: number
    lastAccessedAt: number
    ipAddress: string
    informations: ISessionInformations

}