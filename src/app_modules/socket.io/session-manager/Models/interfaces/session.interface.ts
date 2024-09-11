import { Fingerprints } from "src/app_modules/auth/Models/interfaces/fingerprints.interface";
import { ISessionInformations } from "./session-informations.interface";
import { ISessionTokens } from "./tokens.interface"

export interface ISession {

    userId: string
    restore: boolean
    valid: boolean
    fingerprints: Fingerprints
    createdAt: number
    expiresAt: number
    lastAccessedAt: number
    ipAddress: string
    informations: ISessionInformations
    loggedIn: boolean // Indica se l'utente è loggato o meno, distinguendo due tipi differenti di sessione
    tokens?: ISessionTokens // undefined in caso di sessione di utente non loggato

}