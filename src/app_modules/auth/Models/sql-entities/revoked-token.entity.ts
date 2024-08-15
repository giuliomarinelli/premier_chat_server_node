import { UUID } from "crypto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "revoked_tokens" })
export class RevokedToken {

    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @Column({ type: "uuid", unique: true, nullable: true, default: null })
    jti: UUID | null

    @Column({ type: "text", unique: true })
    token: string

    constructor(token: string, jti?: UUID) {
        
        if (jti) this.jti = jti
        this.token = token

    }

}