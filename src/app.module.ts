import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './app_modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { RequestContextModule } from 'nestjs-request-context';
import { NotificationModule } from './app_modules/notification/notification.module';
import { SocketIoModule } from './app_modules/socket.io/socket.io.module';
import { MongoDbModule } from './app_modules/mongo-db/mongo-db.module';



@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: './env/development.env',
      load: [...config],
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get<TypeOrmModuleOptions>("Data.sqlDB"),
      inject: [ConfigService]
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get<MongooseModuleFactoryOptions>("Data.mongoDB"),
      inject: [ConfigService]
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => configService.get<MailerOptions>("Email"),
      inject: [ConfigService]
    }),
    RequestContextModule,
    NotificationModule,
    SocketIoModule,
    MongoDbModule
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule { }
