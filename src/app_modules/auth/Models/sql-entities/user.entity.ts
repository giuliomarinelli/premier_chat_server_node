import { UUID } from "crypto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Gender } from "../enums/gender.enum";
import { _2FaStrategy } from "../enums/_2fa-strategy.enum";
import { UserRole } from "../enums/user-role.enum";

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
    username: string

    @Column({ unique: true, type: "varchar", length: 100 })
    email: string

    @Column({ default: true })
    isEmailVerified: boolean

    @Column({ type: "varchar", length: 30 })
    previousEmail: string

    @Column({ type: "varchar", length: 255 })
    hashedPassword: string

    @Column({ type: "bigint", default: Date.now() })
    createdAt: number

    @Column({ type: "bigint", default: Date.now() })
    updatedAt: number

    @Column({ type: "simple-array", default: [] })
    _2FaStrategies: _2FaStrategy[]

    @Column({ type: "varchar", length: 20 })
    phoneNumber: string
   
    @Column({ type: "varchar", length: 20 })
    previousPhoneNumber: string

    @Column({ default: false })
    isPhoneNumberVerified: boolean

    @Column({ type: "varchar", length: 255 })
    totpSecret: string

    @Column({ type: "bigint" })
    mustActivateInto: number

    @Column({ default: false })
    isEnabled: boolean

    @Column({ default: false })
    isLocked: boolean

    @Column({ type: "simple-array", default: [UserRole.USER] })
    roles: UserRole[]

}