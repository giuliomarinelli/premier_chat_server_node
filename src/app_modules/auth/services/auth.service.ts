import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../Models/sql-entities/user.entity';
import { Repository } from 'typeorm';
import { Argon2PasswordEncoder } from './argon2-password-encoder';
import { NotificationService } from 'src/app_modules/notification/services/notification.service';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { AuthorizationStrategy } from '../Models/interfaces/authorization-strategy.type';
import { SecurityUtils } from './security-utils';
import { JwtUtils } from './jwt-utils';
import { JwtConfiguration, TotpConfiguration } from 'src/config/@types-config';

@Injectable()
export class AuthService {

    private readonly autgorizationStrategy: AuthorizationStrategy
    private readonly activationTokenConfig: JwtConfiguration
    private readonly totpConfig: TotpConfiguration

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly encoder: Argon2PasswordEncoder,
        private readonly notificationService: NotificationService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly securityUtils: SecurityUtils,
        private readonly jwtUtils: JwtUtils
    ) { 
        this.autgorizationStrategy = configService.get<AuthorizationStrategy>("App.securityStrategy")
        this.activationTokenConfig = configService.get<JwtConfiguration>("Jwt.activationToken")
        this.totpConfig = configService.get<TotpConfiguration>("Totp")
    }

    public async register()
    

}
