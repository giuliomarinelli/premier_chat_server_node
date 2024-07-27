import { UUID } from "crypto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "revoked_tokens" })
export class RevokedToken {

    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @Column({ type: "uuid" })
    jti: UUID

    @Column({ type: "text" })
    token: string

    


}