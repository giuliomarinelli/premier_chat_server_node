import { registerAs } from "@nestjs/config";
import { AppConfiguration, DataConfiguration, JwtConfigurations, SecurityCookieConfiguration, SmsConfiguration, TotpConfiguration } from "./@types-config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { MailerOptions } from "@nestjs-modules/mailer";
import { join } from "path";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export enum ConfigKey {
    App = 'App',
    Data = 'Data',
    Jwt = "Jwt",
    SecurityCookie = 'SecurityCookie',
    Email = "Email",
    Sms = "Sms",
    Totp = "Totp"
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
        corsOrigins: JSON.parse(process.env.CORS_ORIGINS),//
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

const EmailConfig = registerAs(
    ConfigKey.Email, (): MailerOptions => ({
        transport: {
            host: process.env.EMAIL_SMTP_HOST,
            port: Number(process.env.EMAIL_SMTP_PORT),
            secure: !!process.env.EMAIL_SMTP_SECURE,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        },
        defaults: {
            from: process.env.EMAIL_DEFAULT_FROM,
        },
        template: {
            dir: join(__dirname, './email/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
                strict: true,
            },
        },

    })
)

const SmsConfig = registerAs(
    ConfigKey.Sms, (): SmsConfiguration => ({
        accountSID: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        number: process.env.TWILIO_NUMBER,
        from: process.env.TWILIO_FROM
    })
)

const SecurityCookieConfig = registerAs(
    ConfigKey.SecurityCookie, (): SecurityCookieConfiguration => ({
        path: process.env.COOKIE_SECURITY_PATH,
        httpOnly: !!process.env.COOKIE_SECURITY_HTTP_ONLY,
        sameSite: <"Strict" | "Lax" | "None">process.env.COOKIE_SECURITY_SAME_SITE,
        secure: !!process.env.COOKIE_SECURITY_SECURE,
        domain: process.env.COOKIE_SECURITY_DOMAIN,
        secret: process.env.COOKIE_SECURITY_SECRET
    })
)

const TotpConfig = registerAs(
    ConfigKey.Totp, (): TotpConfiguration => ({
        bytes: Number(process.env.TOTP_CONFIG_BYTES),
        digits: Number(process.env.TOTP_CONFIG_DIGITS),
        period: Number(process.env.TOTP_CONFIG_PERIOD)
    })
)

export default [AppConfig, DataConfig, JwtConfig, EmailConfig, SmsConfig, SecurityCookieConfig, TotpConfig]