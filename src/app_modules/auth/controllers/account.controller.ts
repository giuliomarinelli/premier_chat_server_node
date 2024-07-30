import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpCode, HttpStatus, Param, Post, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtUtils } from '../services/jwt-utils';
import { UserService } from '../services/user.service';
import { JwtConfiguration, SecurityCookieConfiguration, TotpConfiguration } from 'src/config/@types-config';
import { SecurityUtils } from '../services/security-utils';
import { TokenType } from '../Models/enums/token-type.enum';
import { FastifyReply, FastifyRequest } from 'fastify';
import { _2FaStrategy } from '../Models/enums/_2fa-strategy.enum';
import { UUID } from 'crypto';
import { User } from '../Models/sql-entities/user.entity';
import { Optional } from 'src/optional/optional';
import { ConfirmOutputWithObscuredContactAndTotpMetadata } from '../Models/output-dto/confirm-login.output.dto';
import { TotpMetadataDto } from '../Models/output-dto/totp-metadata.dto.output';
import { TokenPair } from '../Models/interfaces/token-pair.interface';
import { TotpInputDto } from '../Models/input-dto/totp.input.dto';
import { ConfirmOutputDto } from '../Models/output-dto/confirm.output.dto';


@Controller('account')
export class AccountController {

    private readonly totpConfig: TotpConfiguration
    private readonly phoneNumberVerificationTokenConfig: JwtConfiguration
    private readonly emailVerificationTokenConfig: JwtConfiguration
    private tokenNames: Map<TokenType, string> = new Map()

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
        private readonly jwtUtils: JwtUtils,
        private readonly userService: UserService,
        private readonly securityUtils: SecurityUtils,
        private readonly isAuthCookieOpt: SecurityCookieConfiguration
    ) {
        this.totpConfig = this.configService.get<TotpConfiguration>("TotpConfig")
        this.tokenNames.set(TokenType.ACCESS_TOKEN, "__access_token")
        this.tokenNames.set(TokenType.REFRESH_TOKEN, "__refresh_token")
        this.tokenNames.set(TokenType.WS_ACCESS_TOKEN, "__ws_access_token")
        this.tokenNames.set(TokenType.WS_REFRESH_TOKEN, "__access_token")
        this.tokenNames.set(TokenType.PHONE_NUMBER_VERIFICATION_TOKEN, "__phone_number_verfification_token")
        this.tokenNames.set(TokenType.EMAIL_VERIFICATION_TOKEN, "__email_verification_token")
    }

    @Get("/contact-verification/:strategy/request")
    public async requestTotpForContactVerification(@Param("strategy") strategy: string, @Req() req: FastifyRequest, @Res() res: FastifyReply): Promise<ConfirmOutputWithObscuredContactAndTotpMetadata> {

        const _strategy: _2FaStrategy = this.securityUtils.stringTo_2FaStrategy(strategy)

        const accessToken: string = (<TokenPair>await this.jwtUtils.extractHttpTokensFromContext(req)).accessToken
        const userId: UUID = (await this.jwtUtils.extractPayload(accessToken, TokenType.ACCESS_TOKEN, true)).sub
        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)
        if (userOpt.isEmpty()) throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        let type: TokenType
        let body: ConfirmOutputWithObscuredContactAndTotpMetadata

        switch (_strategy) {

            case _2FaStrategy.SMS: {

                if (user.isPhoneNumberVerified)
                    throw new BadRequestException("Phone number has been already verified.")

                const { phoneNumber, phoneNumberPrefixLength } = user

                const metadata: TotpMetadataDto = await this.authService.sendTotpToVerifyContact(userId, _strategy)

                body = {
                    statusCode: HttpStatus.OK,
                    timestamp: new Date().toISOString(),
                    message: `An SMS was sent to your number with a verification ${this.totpConfig.digits} digits code.`,
                    obscuredPhoneNumber: this.securityUtils.obscurePhoneNumber(phoneNumber, phoneNumberPrefixLength),
                    ...metadata
                }
            }
                break

            case _2FaStrategy.EMAIL: {

                if (user.isEmailVerified)
                    throw new BadRequestException("Email has been already verified.")

                const { email } = user

                const metadata: TotpMetadataDto = await this.authService.sendTotpToVerifyContact(userId, _strategy)

                body = {
                    statusCode: HttpStatus.OK,
                    timestamp: new Date().toISOString(),
                    message: `An SMS was sent to your number with a verification ${this.totpConfig.digits} digits code.`,
                    obscuredEmail: this.securityUtils.obscureEmail(email),
                    ...metadata
                }
            }
        }

        res.setCookie(
            this.tokenNames.get(type),
            await this.jwtUtils.generateToken(userId, type, false),
            this.securityUtils.generateAuthenticationCookieOptions(true)
        )

        return body

    }

    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post("/contact-verification/:strategy/verify-totp")
    public async validateNewContact(@Body() totpInputDto: TotpInputDto, @Param("strategy") strategy: string, @Req() req: FastifyRequest): Promise<ConfirmOutputDto> {

        let verificationToken: string

        const _strategy: _2FaStrategy = this.securityUtils.stringTo_2FaStrategy(strategy)

        switch (_strategy) {

            case _2FaStrategy.SMS:
                verificationToken = req.cookies[this.tokenNames.get(TokenType.PHONE_NUMBER_VERIFICATION_TOKEN)]
                break
            
            case _2FaStrategy.EMAIL:
                verificationToken = req.cookies[this.tokenNames.get(TokenType.EMAIL_VERIFICATION_TOKEN)]

        }

        return await this.authService.validateNewContact(totpInputDto.totp, verificationToken, _strategy)

    }


}
