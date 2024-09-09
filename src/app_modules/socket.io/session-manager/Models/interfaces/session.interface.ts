import { SessionInformations } from "./session-informations.interface";

export interface Session extends Document {
    userId: string; // Può essere un ObjectId in MongoDB
    restore: boolean;
    fingerprint: string; // SHA-256 hash in formato esadecimale
    createdAt: Date;
    expiresAt?: Date;
    lastAccessedAt?: Date;
    ipAddress?: string;
    informations: SessionInformations;
}