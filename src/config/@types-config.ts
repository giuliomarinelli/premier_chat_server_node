import { MongooseModuleFactoryOptions } from "@nestjs/mongoose"
import { TypeOrmModuleOptions } from "@nestjs/typeorm"

export interface AppConfiguration {
    
    port: number
    name: string
    corsOrigins: string[]
    securityStrategy: "COOKIE" | "HEADER"

}

export interface DataConfiguration {

    sqlDB: TypeOrmModuleOptions
    mongoDB: MongooseModuleFactoryOptions
}

export interface JwtConfiguration {

    secret: string
    expiresInMs: number

}

export interface JwtConfigurations {

    accessToken: JwtConfiguration
    refreshToken: JwtConfiguration
    wsAccessToken: JwtConfiguration
    wsRefreshToken: JwtConfiguration
    preAuthorizationToken: JwtConfiguration
    activationToken: JwtConfiguration
    phoneNumberVerificationToken: JwtConfiguration
    emailVerificationToken: JwtConfiguration
    issuer: string

}

export interface SmsConfiguration {

    accountSID: string
    authToken: string
    number: string
    from: string

}

export interface SecurityCookieConfiguration {

    path: string
    httpOnly: boolean
    sameSite: "Strict" | "Lax" | "None"
    secure: boolean
    domain: string
    secret: string

}

export interface TotpConfiguration {

    bytes: number
    digits: number
    period: number

}