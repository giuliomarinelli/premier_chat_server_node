import { BadRequestException, Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Query, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserPostInputDto } from '../Models/input-dto/user-post.input.dto';
import { ConfirmRegistrationOutputDto } from '../Models/output-dto/confirm-registration.output.dto';
import { AuthService } from '../services/auth.service';
import { ConfirmOutputDto } from '../Models/output-dto/confirm.output.dto';
import { ConfigService } from '@nestjs/config';
import { JwtUtils } from '../services/jwt-utils';
import { UserService } from '../services/user.service';
import { SecurityUtils } from '../services/security-utils';
import { TotpConfiguration } from 'src/config/@types-config';
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

@Controller('auth')
export class AuthController {

    // Per il momento ignoro la security strategy implementando esclusivamente l'autenticazione basata sui cookie

    private readonly totpConfig: TotpConfiguration

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
        private readonly jwtUtils: JwtUtils,
        private readonly userService: UserService,
        private readonly securityUtils: SecurityUtils,
    ) {
        this.totpConfig = configService.get<TotpConfiguration>("TotpConfig")
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
                "__access_token",
                authenticationTokens.get(TokenPairType.HTTP).accessToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
            )
            res.setCookie(
                "__refresh_token",
                authenticationTokens.get(TokenPairType.HTTP).refreshToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
            )
            res.setCookie(
                "__ws_access_token",
                authenticationTokens.get(TokenPairType.WS).accessToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
            )
            res.setCookie(
                "__ws_refresh_token",
                authenticationTokens.get(TokenPairType.WS).refreshToken,
                this.securityUtils.generateAuthenticationCookieOptions(!restore)
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


}
