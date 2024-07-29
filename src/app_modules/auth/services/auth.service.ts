import { BadRequestException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { UserPostInputDto } from '../Models/input-dto/user-post.input.dto';
import { ConfirmRegistrationOutputDto } from '../Models/output-dto/confirm-registration.output.dto';
import { ConfirmOutputDto } from '../Models/output-dto/confirm.output.dto';
import { TokenType } from '../Models/enums/token-type.enum';
import { Optional } from 'src/optional/optional';
import { UUID } from 'crypto';

@Injectable()
export class AuthService {

    private readonly authorizationStrategy: AuthorizationStrategy
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
        this.authorizationStrategy = this.configService.get<AuthorizationStrategy>("App.securityStrategy")
        this.activationTokenConfig = this.configService.get<JwtConfiguration>("Jwt.activationToken")
        this.totpConfig = this.configService.get<TotpConfiguration>("Totp")
    }

    public async register(userPostInputDto: UserPostInputDto): Promise<ConfirmRegistrationOutputDto> {

        const {

            firstName,
            lastName,
            dateOfBirth,
            gender,
            username,
            email,
            password,
            phoneNumberPrefix,
            phoneNumberBody

        } = userPostInputDto

        if (phoneNumberPrefix && !phoneNumberBody)
            throw new BadRequestException("'phoneNumberPrefix' was entered but 'phoneNumberBody' is empty")

        if (!phoneNumberPrefix && phoneNumberBody)
            throw new BadRequestException("'phoneNumberPrefix' is empty while 'phoneNumberBody' was entered")

        const user = new User(
            firstName,
            lastName,
            dateOfBirth,
            gender,
            username,
            email,
            await this.encoder.encode(password),
            this.securityUtils.generateTotpSecret(),
            Date.now() + this.activationTokenConfig.expiresInMs,
            phoneNumberPrefix,
            phoneNumberBody
        )

        try {
            await this.userRepository.save(user)
        } catch (e) {
            // Gestire gli errori in cui è violata l'integrità dei dati
            console.error(e)
            throw e
        }

        return {
            statusCode: HttpStatus.CREATED,
            timestamp: new Date().toISOString(),
            message: "Registered successfully, an email with activation token was sent to user",
            obscuredEmail: this.securityUtils.obscureEmail(email)
        }

    }

    public async activateUser(activationToken: string): Promise<ConfirmOutputDto> {

        const isInvalidOrExpired: boolean = await this.jwtUtils
            .verifyToken(activationToken, TokenType.ACTIVATION_TOKEN, false)
        const isInvalidIgnoreExpiration: boolean = await this.jwtUtils
            .verifyToken(activationToken, TokenType.ACTIVATION_TOKEN, true)
        if (isInvalidOrExpired && !isInvalidIgnoreExpiration)
            throw new BadRequestException(`Time for account activation is over`)

        try {
            
            const userId: UUID = (await this.jwtUtils.extractPayload(activationToken, TokenType.ACTIVATION_TOKEN, false)).sub
            const userOpt: Optional<User> = await this.userService.findValidUserById(userId)
            if (userOpt.isEmpty())
                throw new NotFoundException("Resource not found")
            const user: User = userOpt.get()
            user.isEnabled = true
            user.updatedAt = Date.now()
            await this.userRepository.save(user)
            await this.jwtUtils.revokeToken(activationToken, TokenType.ACTIVATION_TOKEN)
            return {
                statusCode: HttpStatus.OK,
                timestamp: new Date().toISOString(),
                message: "Account activated successfully"
            }

        } catch {
            throw new NotFoundException("Resource not found")
        }
    }

    public async usernameAndPasswordAuthentication(username: string, password: string): Promise<UUID> {

        const userOpt: Optional<User> = await this.userService.findValidNotEnabledUserByUsername(username)
        
        if (userOpt.isEmpty())
            throw new UnauthorizedException("Username and/or password are wrong")

        const user: User = userOpt.get()

        if (!await this.encoder.matches(password, user.hashedPassword))
            throw new UnauthorizedException("Username and/or password are wrong")

        // Credenziali verificate => Corrette

        return user.id

    }

    public async is2FaEnabled(userId: UUID): Promise<boolean> {

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)
        
        if (userOpt.isEmpty())
            throw new UnauthorizedException("Username and/or password are wrong")

        const user: User = userOpt.get()

        // Valutare di fare una query ad hoc e vedere se dà
        // problemi di serializzazione come in Java o se funziona

        return user._2FaStrategies.length > 0

    }

    



}
