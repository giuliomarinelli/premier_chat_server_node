import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SecurityUtilsService } from './services/security-utils.service';
import { JwtUtilsService } from './services/jwt-utils.service';
import { Argon2PasswordEncoder } from './services/argon2-password-encoder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './Models/sql-entities/user.entity';
import { RevokedToken } from './Models/sql-entities/revoked-token.entity';

@Module({
  providers: [AuthService, SecurityUtilsService, JwtUtilsService, Argon2PasswordEncoder],
  imports: [TypeOrmModule.forFeature([User, RevokedToken])]
})
export class AuthModule {}
