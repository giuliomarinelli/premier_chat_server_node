import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SecurityUtils } from '../services/security-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtUtils } from '../services/jwt-utils';
import { TokenPair } from '../Models/interfaces/token-pair.interface';
import { TokenType } from '../Models/enums/token-type.enum';
import { TokenPairType } from '../Models/enums/token-pair-type.enum';
import { UserService } from '../services/user.service';
import { JwtPayload } from '../Models/interfaces/jwt-payload.interface';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  private readonly publicExactPaths: string[] = []
  private readonly publicPathPrefixes: string[] = []

  constructor(
    private readonly securityUtils: SecurityUtils,
    private readonly jwtUtils: JwtUtils,
    private readonly userService: UserService
  ) { }

  public async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    // Per adesso implemento esclusivamente l'autenticazione tramite cookie

    const req = context.switchToHttp().getRequest<FastifyRequest>()
    const res = context.switchToHttp().getResponse<FastifyReply>()

    if (this.publicExactPaths.includes(req.url)) return true

    this.publicPathPrefixes.forEach(prefix => {
      if (req.url.startsWith(prefix)) return true
    })

    const tokenPair: TokenPair = <TokenPair>this.jwtUtils.extractHttpTokensFromContext(req)

    if (await this.jwtUtils.verifyToken(tokenPair.accessToken, TokenType.ACCESS_TOKEN, false)) return true

    if (!await this.jwtUtils.verifyToken(tokenPair.accessToken, TokenType.ACCESS_TOKEN, true))
      throw new UnauthorizedException("Invalid access token")

    // REFRESH LATO SERVER

    const newTokenPair: TokenPair = await this.jwtUtils.refreshTokenPair(tokenPair.refreshToken, TokenPairType.HTTP)

    const payload: JwtPayload = await this.jwtUtils.extractPayload(tokenPair.refreshToken, TokenType.REFRESH_TOKEN, false)

    const userId = payload.sub
    const restore = payload.res

    res.setCookie(
      "__access_token",
      newTokenPair.accessToken,
      this.securityUtils.generateAuthenticationCookieOptions(!restore)
    )

    res.setCookie(
      "__refresh_token",
      newTokenPair.refreshToken,
      this.securityUtils.generateAuthenticationCookieOptions(!restore)
    )

    if ((await this.userService.findValidEnabledUserById(userId)).isEmpty())
      throw new ForbiddenException("You don't have the permissions to access this resource")

    return true

  }
}
