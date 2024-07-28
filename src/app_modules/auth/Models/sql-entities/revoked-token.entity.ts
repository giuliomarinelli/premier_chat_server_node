import { UUID } from "crypto";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "revoked_tokens" })
export class RevokedToken {

    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @Column({ type: "uuid", unique: true })
    jti: UUID

    @Index()
    @Column({ type: "text" })
    token: string

}