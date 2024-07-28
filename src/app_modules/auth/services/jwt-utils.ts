import { JwtPayload } from './../Models/interfaces/jwt-payload.interface';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtConfiguration } from 'src/config/@types-config';
import { UserService } from './user.service';
import { RevokedTokenService } from './revoked-token.service';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../Models/enums/token-type.enum';
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class JwtUtils {

    private readonly accessTokenConfig: JwtConfiguration
    private readonly refreshTokenConfig: JwtConfiguration
    private readonly wsAccessTokenConfig: JwtConfiguration
    private readonly wsRefreshTokenConfig: JwtConfiguration
    private readonly preAuthorizationTokenConfig: JwtConfiguration
    private readonly activationTokenConfig: JwtConfiguration
    private readonly phoneNumberVerificationTokenConfig: JwtConfiguration
    private readonly emailVerificationTokenConfig: JwtConfiguration
    private readonly jwtIssuer: string
    private readonly securityStrategy: "COOKIE" | "HEADER"

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly revokedTokenService: RevokedTokenService,
        private readonly jwtService: JwtService
    ) {

        this.accessTokenConfig = this.configService.get<JwtConfiguration>("Jwt.accessToken")
        this.refreshTokenConfig = this.configService.get<JwtConfiguration>("Jwt.refreshToken")
        this.wsAccessTokenConfig = this.configService.get<JwtConfiguration>("Jwt.wsAccessToken")
        this.wsRefreshTokenConfig = this.configService.get<JwtConfiguration>("Jwt.wsRefreshToken")
        this.preAuthorizationTokenConfig = this.configService.get<JwtConfiguration>("Jwt.preAuthorizationToken")
        this.activationTokenConfig = this.configService.get<JwtConfiguration>("Jwt.activationToken")
        this.phoneNumberVerificationTokenConfig = this.configService.get<JwtConfiguration>("Jwt.phoneNumberVerificationToken")
        this.emailVerificationTokenConfig = this.configService.get<JwtConfiguration>("Jwt.emailVerificationToken")
        this.jwtIssuer = this.configService.get<string>("Jwt.issuer")
        this.securityStrategy = this.configService.get<"COOKIE" | "HEADER">("App.securityStrategy")

    }


    private getJwtConfigurationFromTokenType(type: TokenType): JwtConfiguration {

        let jwtConfig: JwtConfiguration

        switch (type) {

            case TokenType.ACCESS_TOKEN:
                jwtConfig = this.accessTokenConfig
                break
            case TokenType.REFRESH_TOKEN:
                jwtConfig = this.refreshTokenConfig
                break
            case TokenType.WS_ACCESS_TOKEN:
                jwtConfig = this.wsAccessTokenConfig
                break
            case TokenType.WS_REFRESH_TOKEN:
                jwtConfig = this.wsRefreshTokenConfig
                break
            case TokenType.PRE_AUTHORIZATION_TOKEN:
                jwtConfig = this.preAuthorizationTokenConfig
                break
            case TokenType.ACTIVATION_TOKEN:
                jwtConfig = this.activationTokenConfig
                break
            case TokenType.PHONE_NUMBER_VERIFICATION_TOKEN:
                jwtConfig = this.phoneNumberVerificationTokenConfig
                break
            case TokenType.EMAIL_VERIFICATION_TOKEN:
                jwtConfig = this.emailVerificationTokenConfig

        }

        return jwtConfig

    }


    public async generateToken(userId: UUID, type: TokenType, restore: boolean): Promise<string> {

        const jwtConfig = this.getJwtConfigurationFromTokenType(type)

        return await this.jwtService.signAsync(
            {
                iss: this.jwtIssuer,
                sub: userId,
                jti: uuidv4(),
                typ: type,
                res: restore,
                iat: Date.now(),
                exp: Date.now() + jwtConfig.expiresInMs
            },
            {
                algorithm: "HS256",
                secret: jwtConfig.secret
            }
        )

    }


    public async verifyToken(token: string, type: TokenType, ignoreExpiration: boolean): Promise<boolean> {

        const jwtConfig = this.getJwtConfigurationFromTokenType(type)

        try {

            await this.jwtService.verifyAsync(token, { ignoreExpiration, algorithms: ["HS256"], secret: jwtConfig.secret })
            return true // !token revocato

        } catch {

            return false

        }

    }


    public async extractPayload(token: string, type: TokenType, ignoreExpiration: boolean): Promise<JwtPayload> {
// Token revocato
        if (! await this.verifyToken(token, type, ignoreExpiration))
            throw new UnauthorizedException(`Invalid ${type.toLowerCase().replaceAll("_", " ")}`)

        return this.jwtService.decode<JwtPayload>(token)

    }


    







}
