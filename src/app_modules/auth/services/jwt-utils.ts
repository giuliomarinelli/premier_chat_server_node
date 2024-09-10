import { TokenPairType } from './../Models/enums/token-pair-type.enum';
import { JwtPayload } from './../Models/interfaces/jwt-payload.interface';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtConfiguration } from '../../../config/@types-config';
import { RevokedTokenService } from './revoked-token.service';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '../Models/enums/token-type.enum';
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid'
import { TokenPair } from '../Models/interfaces/token-pair.interface';
import { FastifyRequest } from 'fastify';
import { RevokedToken } from '../Models/sql-entities/revoked-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerateTokenOptions } from '../Models/interfaces/generate-token-options.interface';

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
        private readonly revokedTokenService: RevokedTokenService,
        private readonly jwtService: JwtService,
        @InjectRepository(RevokedToken) private readonly revokedTokenRepository: Repository<RevokedToken>
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


    public async generateToken(
        userId: UUID,
        type: TokenType,
        restore: boolean,
        options: GenerateTokenOptions | undefined = undefined
    ): Promise<string> {

        const { fingerprint, ip } = options || {}

        if ((type === TokenType.REFRESH_TOKEN || type === TokenType.WS_REFRESH_TOKEN
            || type === TokenType.PRE_AUTHORIZATION_TOKEN) && !fingerprint)
            throw new BadRequestException("No provided fingerprint")

        if ((type === TokenType.ACCESS_TOKEN || type === TokenType.WS_ACCESS_TOKEN || type === TokenType.REFRESH_TOKEN
            || type === TokenType.WS_REFRESH_TOKEN || type === TokenType.PRE_AUTHORIZATION_TOKEN) && !ip)
            throw new BadRequestException("Unknown ip address")

        const jwtConfig = this.getJwtConfigurationFromTokenType(type)

        return await this.jwtService.signAsync(
            {
                iss: this.jwtIssuer,
                sub: userId,
                jti: uuidv4(),
                typ: type,
                res: restore,
                fgp: fingerprint,
                ip,
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
            return !await this.isRevokedToken(token, type)

        } catch {

            return false

        }

    }


    public async extractPayload(token: string, type: TokenType, ignoreExpiration: boolean): Promise<JwtPayload> {

        if (await this.isRevokedToken(token, type))
            throw new UnauthorizedException(`Revoked ${type.toLowerCase().replaceAll("_", " ")}`)

        if (!await this.verifyToken(token, type, ignoreExpiration))
            throw new UnauthorizedException(`Invalid ${type.toLowerCase().replaceAll("_", " ")}`)

        return this.jwtService.decode<JwtPayload>(token)

    }


    public extractHttpTokensFromContext(req: FastifyRequest): TokenPair | string {

        switch (this.securityStrategy) {

            case "COOKIE":

                const accessToken: string = req.cookies['__access_token']
                if (!accessToken) throw new UnauthorizedException("No provided access token")

                const refreshToken: string = req.cookies['__refresh_token']
                if (!refreshToken) throw new UnauthorizedException("No provided refresh token")

                return <TokenPair>{
                    accessToken,
                    refreshToken,
                    type: TokenPairType.HTTP
                }

            case "HEADER":

                const authHeader: string | undefined = req.headers.authorization

                if (!authHeader || !authHeader.startsWith('Bearer '))
                    throw new UnauthorizedException("No provided access token")

                return <string>authHeader.split(" ")[1]

        }

    }


    // Web Socket estrazione token =======================================

    public async revokeToken(token: string, type?: TokenType): Promise<void> {

        let revokedToken: RevokedToken

        if (type) {

            const jti = (await this.extractPayload(token, type, true)).jti
            revokedToken = new RevokedToken(token, jti)

        } else {

            revokedToken = new RevokedToken(token)

        }

        await this.revokedTokenRepository.save(revokedToken)

    }


    public async isRevokedToken(token: string, type?: TokenType): Promise<boolean> {

        if (type) {

            const jti = (await this.extractPayload(token, type, true)).jti
            return (await this.revokedTokenService.findByJti(jti)).isPresent()

        }

        return (await this.revokedTokenService.findByToken(token)).isPresent()

    }


    public async refreshTokenPair(refreshToken: string, type: TokenPairType): Promise<TokenPair> {

        switch (type) {

            case TokenPairType.HTTP:
                const payload: JwtPayload = await this.extractPayload(refreshToken, TokenType.REFRESH_TOKEN, false)
                await this.revokeToken(refreshToken, TokenType.REFRESH_TOKEN)
                return {
                    accessToken: await this.generateToken(payload.sub, TokenType.ACCESS_TOKEN, payload.res),
                    refreshToken: await this.generateToken(payload.sub, TokenType.REFRESH_TOKEN, payload.res),
                    type
                }

            case TokenPairType.WS:
                const _payload: JwtPayload = await this.extractPayload(refreshToken, TokenType.WS_REFRESH_TOKEN, false)
                await this.revokeToken(refreshToken, TokenType.WS_REFRESH_TOKEN)
                return {
                    accessToken: await this.generateToken(_payload.sub, TokenType.WS_ACCESS_TOKEN, _payload.res),
                    refreshToken: await this.generateToken(_payload.sub, TokenType.WS_REFRESH_TOKEN, _payload.res),
                    type
                }

        }

    }

    public async getFingerprintFromToken(token: string, type: TokenType): Promise<string> | never {

        switch (type) {
            case TokenType.REFRESH_TOKEN:
            case TokenType.WS_REFRESH_TOKEN:
            case TokenType.PRE_AUTHORIZATION_TOKEN:
                if (!this.verifyToken(token, type, false)) throw new UnauthorizedException()
                return <string>(await this.extractPayload(token, type, false)).fgp
            default: throw new BadRequestException()
        }

    }




}
