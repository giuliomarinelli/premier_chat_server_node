import { TokenPair } from './../Models/interfaces/token-pair.interface';
import { TokenPairType } from './../Models/enums/token-pair-type.enum';
import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { _2FaStrategy } from '../Models/enums/_2fa-strategy.enum';
import { TotpMetadataDto } from '../Models/output-dto/totp-metadata.dto.output';
import { EmailTotpContext } from 'src/app_modules/notification/Models/interfaces/contexts/email-totp.context';
import { join } from 'path';

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
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        // Valutare di fare una query ad hoc e vedere se dà
        // problemi di serializzazione come in Java o se funziona

        return user._2FaStrategies.length > 0

    }

    public async sendTotpToVerifyContact(userId: UUID, strategy: _2FaStrategy): Promise<TotpMetadataDto> {

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)

        if (userOpt.isEmpty())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        switch (strategy) {

            case _2FaStrategy.SMS: {

                if (!user.phoneNumber || !user.phoneNumber.trim())
                    throw new BadRequestException("You don't have provided a valid phone number")

                if (user.isPhoneNumberVerified)
                    throw new BadRequestException("Your phone number has already been verified")

                const { TOTP, ...metadata } = this.securityUtils.generateTotp(user.totpSecret)

                await this.notificationService.sendSms(
                    user.phoneNumber, `Hello ${user.firstName}. Here is your code to verify`
                + ` your phone number:\n\n${TOTP}\n\n It's valid ${this.totpConfig.period} seconds.`
                )

                return metadata
            }

            case _2FaStrategy.EMAIL: {

                if (!user.email || !user.email.trim())
                    throw new BadRequestException("You don't have provided a valid phone number")

                if (user.isEmailVerified)
                    throw new BadRequestException("Your email has already been verified")

                const { TOTP, ...metadata } = this.securityUtils.generateTotp(user.totpSecret)

                await this.notificationService.sendEmail<EmailTotpContext>(
                    user.email,
                    "Your Premier Chat verification code",
                    {
                        firstName: user.firstName,
                        totp: TOTP,
                        period: this.totpConfig.period
                    },
                    join(__dirname, "../../notification/email-templates/email-verification.hbs")
                )

                return metadata
            }
        }

    }

    public async verifyContactBeforeGenerating2faTotp(preAuthorizationToken: string, contact: string, strategy: _2FaStrategy): Promise<TotpMetadataDto> {

        let userId: UUID

        try {
            userId = (await this.jwtUtils.extractPayload(preAuthorizationToken, TokenType.PRE_AUTHORIZATION_TOKEN, false)).sub
        } catch {
            throw new ForbiddenException("You don't have the permissions to access this resource")
        }

        const userOpt: Optional<User> = await this.userService.findValidUserById(userId)

        if (userOpt.isEmpty())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        if (!user._2FaStrategies.includes(strategy))
            throw new BadRequestException(`${strategy.toLowerCase()} strategy for 2 factor authentication is not enabled for this user`)

        const { TOTP, ...metadata } = this.securityUtils.generateTotp(user.totpSecret)

        switch (strategy) {

            case _2FaStrategy.EMAIL:

                if (contact !== user.email) {
                    await this.jwtUtils.revokeToken(preAuthorizationToken, TokenType.PRE_AUTHORIZATION_TOKEN)
                    throw new UnauthorizedException("Email entered is wrong")
                }
                await this.notificationService.sendEmail<EmailTotpContext>(
                    user.email,
                    "Your code to access Premier Chat",
                    {
                        firstName: user.firstName,
                        totp: TOTP,
                        period: this.totpConfig.period
                    },
                    join(__dirname, "../../notification/email-templates/send-totp-for-2fa.hbs")

                )
                break

            case _2FaStrategy.SMS:

                if (contact !== user.phoneNumber) {
                    await this.jwtUtils.revokeToken(preAuthorizationToken, TokenType.PRE_AUTHORIZATION_TOKEN)
                    throw new UnauthorizedException("Phone Number entered is wrong")
                }
                await this.notificationService.sendSms(
                    user.phoneNumber,
                    `Hello ${user.firstName}. Here is your code to access Premier Chat:\n\nTOTP\n\n` +
                    `It's valid ${this.totpConfig.period} seconds.`
                )

        }

        return metadata

    }

    public async performAuthentication(userId: UUID, restore: boolean): Promise<Map<TokenPairType, TokenPair>> {

        const tokensMap = new Map<TokenPairType, TokenPair>()

        tokensMap.set(TokenPairType.HTTP, {
            accessToken: await this.jwtUtils.generateToken(userId, TokenType.ACCESS_TOKEN, restore),
            refreshToken: await this.jwtUtils.generateToken(userId, TokenType.REFRESH_TOKEN, restore),
            type: TokenPairType.HTTP
        })

        tokensMap.set(TokenPairType.HTTP, {
            accessToken: await this.jwtUtils.generateToken(userId, TokenType.WS_ACCESS_TOKEN, restore),
            refreshToken: await this.jwtUtils.generateToken(userId, TokenType.WS_REFRESH_TOKEN, restore),
            type: TokenPairType.WS
        })

        return tokensMap

    }

    public async disable2Fa(userId: UUID, strategy: _2FaStrategy): Promise<ConfirmOutputDto> {

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)

        if (userOpt.isEmpty())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        if (!user._2FaStrategies.includes(strategy))
            throw new BadRequestException(
                `Cannot proceed because 2 factors authentication via ${strategy.toLowerCase()} isn't enabled`
            )

        const i: number = <number>user._2FaStrategies.indexOf(strategy)
        user._2FaStrategies.splice(i, 1)
        await this.userRepository.save(user)

        return {
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: `2 factors authentication via ${strategy.toLowerCase()} has been successfully disabled`
        }

    }

    public async enable2Fa(userId: UUID, strategy: _2FaStrategy): Promise<ConfirmOutputDto> {

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)

        if (userOpt.isEmpty())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        switch (strategy) {

            case _2FaStrategy.SMS:

                if (!user.isPhoneNumberVerified)
                    throw new BadRequestException("Cannot enable 2 factors authentication via SMS because your phone number hasn't been verified")
                break

            case _2FaStrategy.EMAIL:

                if (!user.isEmailVerified)
                    throw new BadRequestException("Cannot enable 2 factors authentication via email because your email address hasn't been verified")

        }
        if (user._2FaStrategies.includes(strategy))
            throw new BadRequestException(`Cannot proceed because 2 factors authentication via ${strategy.toLowerCase()} is already enabled`)

        user._2FaStrategies.push(strategy)
        await this.userRepository.save(user)

        return {
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: `2 factors authentication via ${strategy.toLowerCase()} has been successfully enabled`
        }

    }

    public async updateEmail(newEmail: string, userId: UUID): Promise<ConfirmOutputDto> {

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)

        if (userOpt.isEmpty())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        user.previousEmail = user.email
        user.email = newEmail
        user.isEmailVerified = false

        await this.userRepository.save(user)

        return {
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: "Your email has been successfully updated. You must verify your new email before you can use it in the app."
        }

    }

    public async updatePhoneNumber(newPhoneNumber: string, userId: UUID): Promise<ConfirmOutputDto> {

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)

        if (userOpt.isEmpty())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        user.previousPhoneNumber = user.phoneNumber
        user.phoneNumber = newPhoneNumber
        user.isPhoneNumberVerified = false

        await this.userRepository.save(user)

        return {
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: "Your phone number has been successfully updated. You must verify your new phone number before you can use it in the app."
        }

    }


}
