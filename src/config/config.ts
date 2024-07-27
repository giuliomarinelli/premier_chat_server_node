import { registerAs } from "@nestjs/config";
import { AppConfig, DataConfig } from "./@types-config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export enum ConfigKey {
    App = 'App',
    Data = 'Data',
    Cookie = 'Cookie',
    Exp = "Exp",
    Keys = "Keys",
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
    ConfigKey.App, (): AppConfig => ({
        port: Number(process.env.APP_PORT),
        name: process.env.APP_NAME,
        corsOrigins: JSON.parse(process.env.CORS_ORIGINS),
        securityStrategy: <"COOKIE" | "HEADER">process.env.APP_SECURITY_STRATEGY
    })
)

const DataConfig = registerAs(ConfigKey.Data, (): DataConfig => ({
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
