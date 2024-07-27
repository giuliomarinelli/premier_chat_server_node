import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtConfiguration } from 'src/config/@types-config';
import { UserService } from './user.service';
import { RevokedTokenService } from './revoked-token.service';

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

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly revokedTokenService: RevokedTokenService
    ) {

        this.accessTokenConfig = configService.get<JwtConfiguration>("Jwt.accessToken")
        this.refreshTokenConfig = configService.get<JwtConfiguration>("Jwt.refreshToken")
        this.wsAccessTokenConfig = configService.get<JwtConfiguration>("Jwt.wsAccessToken")
        this.wsRefreshTokenConfig = configService.get<JwtConfiguration>("Jwt.wsRefreshToken")
        this.preAuthorizationTokenConfig = configService.get<JwtConfiguration>("Jwt.preAuthorizationToken")
        this.activationTokenConfig = configService.get<JwtConfiguration>("Jwt.activationToken")
        this.phoneNumberVerificationTokenConfig = configService.get<JwtConfiguration>("Jwt.phoneNumberVerificationToken")
        this.emailVerificationTokenConfig = configService.get<JwtConfiguration>("Jwt.emailVerificationToken")
        this.jwtIssuer = configService.get<string>("Jwt.issuer")
    }

}
