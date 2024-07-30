import { BadRequestException, Body, Controller, ForbiddenException, HttpCode, HttpStatus, Param, Post, Query, Req, Res, UnauthorizedException, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserPostInputDto } from '../Models/input-dto/user-post.input.dto';
import { ConfirmRegistrationOutputDto } from '../Models/output-dto/confirm-registration.output.dto';
import { AuthService } from '../services/auth.service';
import { ConfirmOutputDto } from '../Models/output-dto/confirm.output.dto';
import { ConfigService } from '@nestjs/config';
import { JwtUtils } from '../services/jwt-utils';
import { UserService } from '../services/user.service';
import { SecurityUtils } from '../services/security-utils';
import { SecurityCookieConfiguration, TotpConfiguration } from 'src/config/@types-config';
import { FastifyReply } from 'fastify/types/reply';
import { LoginDto } from '../Models/input-dto/login.dto';
import { ConfirmLoginOutputDto } from '../Models/output-dto/confirm-login.output.dto';
import { UUID } from 'crypto';
import { TokenPairType } from '../Models/enums/token-pair-type.enum';
import { TokenPair } from '../Models/interfaces/token-pair.interface';
import { TokenType } from '../Models/enums/token-type.enum';
import { Optional } from 'src/optional/optional';
import { User } from '../Models/sql-entities/user.entity';
import { _2FaStrategy } from '../Models/enums/_2fa-strategy.enum';
import { FastifyRequest } from 'fastify';
import { ContactVerificationDto } from '../Models/input-dto/contact-verification.dto';
import { ConfirmWithTotpMetadataDto } from '../Models/output-dto/confirm-with-totp-metadata.dto';
import { TotpMetadataDto } from '../Models/output-dto/totp-metadata.dto.output';
import { TotpInputDto } from '../Models/input-dto/totp.input.dto';
import { JwtPayload } from '../Models/interfaces/jwt-payload.interface';


@Controller('auth')
export class AuthController {

    // Per il momento ignoro la security strategy implementando esclusivamente l'autenticazione basata sui cookie

    private readonly totpConfig: TotpConfiguration
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
        this.tokenNames.set(TokenType.PRE_AUTHORIZATION_TOKEN, "__pre_authorization_token")
        this.isAuthCookieOpt = this.configService.get<SecurityCookieConfiguration>("IsAuthCookie")
        console.log('prova')
    }

    @Post("/register")
    @UsePipes(new ValidationPipe({ transform: true }))
    public async register(@Body() userDto: UserPostInputDto): Promise<ConfirmRegistrationOutputDto> {

        return await this.authService.register(userDto)

    }

    @Post("/activate-account")
    @HttpCode(HttpStatus.OK)
    public async activateAccount(@Query("at") activationToken: string): Promise<ConfirmOutputDto> {

        if (!activationToken) throw new BadRequestException("'at' query param is required")
        return await this.authService.activateUser(activationToken)

    }

    @Post("/login")
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async login(@Body() loginDto: LoginDto, @Res() res: FastifyReply): Promise<ConfirmLoginOutputDto> {

        const { username, password, restore } = loginDto
        const userId: UUID = await this.authService.usernameAndPasswordAuthentication(username, password)

        const authenticationTokens: Map<TokenPairType, TokenPair> = await this.authService.performAuthentication(userId, restore)

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)

        if (userOpt.isEmpty()) throw new ForbiddenException("You don't have the permissions to acccess this resource")

        const user: User = userOpt.get()

        if (!await this.authService.is2FaEnabled(userId)) {

            res.setCookie(
                this.tokenNames.get(TokenType.ACCESS_TOKEN),
                authenticationTokens.get(TokenPairType.HTTP).accessToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
            )
            res.setCookie(
                this.tokenNames.get(TokenType.REFRESH_TOKEN),
                authenticationTokens.get(TokenPairType.HTTP).refreshToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
            )
            res.setCookie(
                this.tokenNames.get(TokenType.WS_ACCESS_TOKEN),
                authenticationTokens.get(TokenPairType.WS).accessToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
            )
            res.setCookie(
                this.tokenNames.get(TokenType.WS_REFRESH_TOKEN),
                authenticationTokens.get(TokenPairType.WS).refreshToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
            )
            res.setCookie(
                "__is_auth", 
                this.authService.generateIsAuthCookieValue(),
                this.securityUtils.generateAuthenticationCookieOptions(!restore, this.isAuthCookieOpt)
            )   

            return {
                statusCode: HttpStatus.OK,
                timestamp: new Date().toISOString(),
                message: "Logged in successfully"
            }

        } else {

            const { _2FaStrategies, email, phoneNumber, phoneNumberPrefixLength } = user

            let _email: boolean = false, _sms: boolean = false

            if (_2FaStrategies.includes(_2FaStrategy.EMAIL)) _email = true
            if (_2FaStrategies.includes(_2FaStrategy.SMS)) _sms = true

            const preAuthorizationToken: string = await this.jwtUtils.generateToken(userId, TokenType.PRE_AUTHORIZATION_TOKEN, restore)

            res.setCookie("__pre_authorization_token", preAuthorizationToken)

            return {
                statusCode: HttpStatus.OK,
                timestamp: new Date().toISOString(),
                message: "First step of 2 factors authentication went on successfully, please verify your contact to receive a code",
                obscuredEmail: _email ? this.securityUtils.obscureEmail(email) : undefined,
                obscuredPhoneNumber: _sms ? this.securityUtils.obscurePhoneNumber(phoneNumber, phoneNumberPrefixLength) : undefined
            }
        }
    }

    @Post("/logout")
    @HttpCode(HttpStatus.OK)
    public async logout(@Req() req: FastifyRequest, @Res() res: FastifyReply): Promise<ConfirmOutputDto> {

        const tokens: Map<TokenType, string> = new Map()
        tokens.set(TokenType.ACCESS_TOKEN, req.cookies[this.tokenNames.get(TokenType.ACCESS_TOKEN)])
        tokens.set(TokenType.REFRESH_TOKEN, req.cookies[this.tokenNames.get(TokenType.REFRESH_TOKEN)])
        tokens.set(TokenType.WS_ACCESS_TOKEN, req.cookies[this.tokenNames.get(TokenType.WS_ACCESS_TOKEN)])
        tokens.set(TokenType.WS_REFRESH_TOKEN, req.cookies[this.tokenNames.get(TokenType.WS_REFRESH_TOKEN)])

        for (const key of tokens.keys()) {

            await this.jwtUtils.revokeToken(tokens.get(key), key)
            res.clearCookie[this.tokenNames.get(key)]

        }
        res.clearCookie("__is_auth")

        return {
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: "Logged out successfully"
        }

    }

    @Post("/2-factors-authentication/totp/:strategy/request")
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async requestTotpFor2Fa(@Param("strategy") strategy: string, @Body() contactVerificationDto: ContactVerificationDto, @Req() req: FastifyReply): Promise<ConfirmWithTotpMetadataDto> {

        const _strategy: _2FaStrategy = this.securityUtils.stringTo_2FaStrategy(strategy)

        const preAuthorizationToken: string = req.cookies[this.tokenNames.get(TokenType.PRE_AUTHORIZATION_TOKEN)]

        if (!preAuthorizationToken || !preAuthorizationToken.trim())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const { contact } = contactVerificationDto

        let endOfMessage: string

        switch (_strategy) {

            case _2FaStrategy.EMAIL:
                endOfMessage = "to your email address"
                break

            case _2FaStrategy.SMS:
                endOfMessage = "via SMS to your phone number"

        }

        const metadata: TotpMetadataDto = await this.authService.verifyContactBeforeGenerating2faTotp(preAuthorizationToken, contact, _strategy)

        return {
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: `A ${this.totpConfig.digits} digits code valid for ${this.totpConfig.period} seconds has been sent ${endOfMessage}`,
            ...metadata
        }

    }

    @Post("/2-factors-authentication/totp/verify")
    @HttpCode(HttpStatus.OK)
    @UsePipes(new ValidationPipe({ transform: true }))
    public async verifyTotpFor2Fa(@Body() totpInputDto: TotpInputDto, @Req() req: FastifyRequest, @Res()  res: FastifyReply): Promise<ConfirmOutputDto> {

        const preAuthorizationToken = req.cookies[this.tokenNames.get(TokenType.PRE_AUTHORIZATION_TOKEN)]

        if (!preAuthorizationToken || !preAuthorizationToken.trim())
            throw new ForbiddenException("You don't have the permissions to access this resource")

        const payload: JwtPayload = await this.jwtUtils.extractPayload(preAuthorizationToken, TokenType.PRE_AUTHORIZATION_TOKEN, false)
        const userId: UUID = payload.sub
        const restore: boolean = payload.res

        const userOpt: Optional<User> = await this.userService.findValidEnabledUserById(userId)

        if (userOpt.isEmpty()) throw new ForbiddenException("You don't have the permissions to access this resource")

        const user: User = userOpt.get()

        if (!this.securityUtils.verifyTotp(totpInputDto.totp, user.totpSecret)) {

            await this.jwtUtils.revokeToken(preAuthorizationToken, TokenType.PRE_AUTHORIZATION_TOKEN)
            throw new UnauthorizedException("The code entered for 2 factors authentication is wrong")

        }

        const authenticationTokens: Map<TokenPairType, TokenPair> = await this.authService.performAuthentication(userId, restore)

        res.setCookie(
            this.tokenNames.get(TokenType.ACCESS_TOKEN),
            authenticationTokens.get(TokenPairType.HTTP).accessToken,
            this.securityUtils.generateAuthenticationCookieOptions(!restore)
        )
        res.setCookie(
            this.tokenNames.get(TokenType.REFRESH_TOKEN),
            authenticationTokens.get(TokenPairType.HTTP).refreshToken,
            this.securityUtils.generateAuthenticationCookieOptions(!restore)
        )
        res.setCookie(
            this.tokenNames.get(TokenType.WS_ACCESS_TOKEN),
            authenticationTokens.get(TokenPairType.WS).accessToken,
            this.securityUtils.generateAuthenticationCookieOptions(!restore)
        )
        res.setCookie(
            this.tokenNames.get(TokenType.WS_REFRESH_TOKEN),
            authenticationTokens.get(TokenPairType.WS).refreshToken,
            this.securityUtils.generateAuthenticationCookieOptions(!restore)
        )
        res.setCookie(
            "__is_auth", 
            this.authService.generateIsAuthCookieValue(),
            this.securityUtils.generateAuthenticationCookieOptions(!restore, this.isAuthCookieOpt)
        )   

        return {
            statusCode: HttpStatus.OK,
            timestamp: new Date().toISOString(),
            message: "Logged in successfully"
        }

    }

}
