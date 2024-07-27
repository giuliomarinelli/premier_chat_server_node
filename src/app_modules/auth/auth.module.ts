import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SecurityUtilsService } from './services/security-utils.service';
import { JwtUtilsService } from './services/jwt-utils.service';
import { Argon2PasswordEncoder } from './services/argon2-password-encoder';

@Module({
  providers: [AuthService, SecurityUtilsService, JwtUtilsService, Argon2PasswordEncoder],
  imports: []
})
export class AuthModule {}
