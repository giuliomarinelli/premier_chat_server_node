import { TypeOrmModuleOptions } from "@nestjs/typeorm"

export interface AppConfig {
    
    port: number
    name: string
    corsOrigins: string[]
    securityStrategy: "COOKIE" | "HEADER"

}

export interface DataConfig {

    sqlDB: TypeOrmModuleOptions
    mongoDB: {
        uri: string
    }

}

