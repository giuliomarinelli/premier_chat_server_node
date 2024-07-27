import { registerAs } from "@nestjs/config";
import { AppConfig, AppConfiguration, DataConfig, DataConfiguration, JwtConfigurations } from "./@types-config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export enum ConfigKey {
    App = 'App',
    Data = 'Data',
    Jwt = "Jwt",
    Cookie = 'Cookie',
    Exp = "Exp",
    Email = "Email",
    Twilio = "Twilio"
}

export enum Environment {
    Local = 'local',
    Development = 'development',
    Staging = 'staging',
    Production = 'production',
    Testing = 'testing',
}

const AppConfig = registerAs(
    ConfigKey.App, (): AppConfiguration => ({
        port: Number(process.env.APP_PORT),
        name: process.env.APP_NAME,
        corsOrigins: JSON.parse(process.env.CORS_ORIGINS),
        securityStrategy: <"COOKIE" | "HEADER">process.env.APP_SECURITY_STRATEGY
    })
)

const DataConfig = registerAs(
    ConfigKey.Data, (): DataConfiguration => ({
    sqlDB: {
        type: process.env.SQL_DATABASE_TYPE as 'mariadb' | 'postgres',
        host: process.env.SQL_DATABASE_HOST,
        port: Number(process.env.SQL_DATABASE_PORT),
        username: process.env.SQL_DATABASE_USERNAME,
        password: process.env.SQL_DATABASE_PASSWORD,
        database: process.env.SQL_DATABASE,
        synchronize: !!process.env.SQL_DATABASE_SYNCHRONIZE,
        logging: !!process.env.SQL_DATABASE_LOGGING,
        logger: process.env.SQL_DATABASE_LOGGER as 'debug' | 'file' | 'simple-console' | 'advanced-console',
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy()
    },
    mongoDB: {
        uri: process.env.MONGO_DB_URI
    }
}))

const JwtConfig = registerAs(
    ConfigKey.Jwt, (): JwtConfigurations => ({
    accessToken: {
        secret: process.env.JWT_SECRETS_ACCESS_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_ACCESS_TOKEN)
    },
    refreshToken: {
        secret: process.env.JWT_SECRETS_REFRESH_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_REFRESH_TOKEN)
    },
    wsAccessToken: {
        secret: process.env.JWT_SECRETS_WS_ACCESS_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_WS_ACCESS_TOKEN)
    },
    wsRefreshToken: {
        secret: process.env.JWT_SECRETS_WS_REFRESH_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_WS_REFRESH_TOKEN)
    },
    preAuthorizationToken: {
        secret: process.env.JWT_SECRETS_PRE_AUTHORIZATION_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_PRE_AUTHORIZATION_TOKEN)
    },
    activationToken: {
        secret: process.env.JWT_SECRETS_ACTIVATION_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_ACTIVATION_TOKEN)
    },
    phoneNumberVerificationToken: {
        secret: process.env.JWT_SECRETS_PHONE_NUMBER_VERIFICATION_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_PHONE_NUMBER_VERIFICATION_TOKEN)
    },
    emailVerificationToken: {
        secret: process.env.JWT_SECRETS_EMAIL_VERIFICATION_TOKEN,
        expiresInMs: Number(process.env.JWT_EXPIRATION_EMAIL_VERIFICATION_TOKEN)
    },
    issuer: process.env.JWT_ISSUER
}))

