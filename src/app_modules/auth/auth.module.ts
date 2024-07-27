import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SecurityUtilsService } from './services/security-utils.service';
import { JwtUtilsService } from './services/jwt-utils/jwt-utils.service';

@Module({
  providers: [AuthService, SecurityUtilsService, JwtUtilsService],
  imports: []
})
export class AuthModule {}
