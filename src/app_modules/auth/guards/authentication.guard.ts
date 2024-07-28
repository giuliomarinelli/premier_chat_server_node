import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SecurityUtils } from '../services/security-utils';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtUtils } from '../services/jwt-utils';
import { TokenPair } from '../Models/interfaces/token-pair.interface';
import { TokenType } from '../Models/enums/token-type.enum';

@Injectable()
export class AuthenticationGuard implements CanActivate {

  private readonly publicExactPaths: string[] = []
  private readonly publicPathPrefixes: string[] = []

  constructor(
    private readonly securityUtils: SecurityUtils,
    private readonly jwtUtils: JwtUtils
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

      const tokenPair: TokenPair = this.jwtUtils.extractHttpTokensFromContext(req)

      if (await this.jwtUtils.verifyToken(tokenPair.accessToken, TokenType.ACCESS_TOKEN, false)) return true

  }
}
