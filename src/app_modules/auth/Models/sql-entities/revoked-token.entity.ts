import { UUID } from "crypto";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "revoked_tokens" })
export class RevokedToken {

    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @Column({ type: "uuid", unique: true, nullable: true, default: null })
    jti: UUID

    @Index()
    @Column({ type: "text" })
    token: string

    constructor(token: string, jti?: UUID) {
        
        if (jti) this.jti = jti
        this.token = token

    }

}