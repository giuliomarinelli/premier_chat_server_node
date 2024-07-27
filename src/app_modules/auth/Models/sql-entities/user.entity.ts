import { UUID } from "crypto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Gender } from "../enums/gender.enum";

@Entity({ name: "users" })
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: UUID

    @Column({ type: "varchar", length: 30 })
    firstName: string

    @Column({ type: "varchar", length: 30 })
    lastName: string

    @Column({ type: "bigint" })
    dateOfBirth: number

    @Column({ type: "varchar", length: 20 })
    gender: Gender

    @Column({ unique: true, type: "varchar", length: 30 })
    email: string

    @Column()
    emailVerified: boolean

    @Column({ type: "varchar", length: 30 })
    previousEmail: string

    @Column({ type: "varchar", length: 255 })
    hashedPassword: string

}