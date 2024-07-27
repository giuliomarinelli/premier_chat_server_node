import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SecurityUtils } from './services/security-utils';
import { JwtUtils } from './services/jwt-utils';
import { Argon2PasswordEncoder } from './services/argon2-password-encoder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Models/sql-entities/user.entity';
import { RevokedToken } from './Models/sql-entities/revoked-token.entity';
import { UserService } from './services/user.service';
import { RevokedTokenService } from './services/revoked-token.service';

@Module({
  providers: [AuthService, SecurityUtils, JwtUtils, Argon2PasswordEncoder, UserService, RevokedTokenService],
  imports: [TypeOrmModule.forFeature([User, RevokedToken])]
})
export class AuthModule {}
