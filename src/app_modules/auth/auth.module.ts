import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SecurityUtilsService } from './services/security-utils.service';

@Module({
  providers: [AuthService, SecurityUtilsService],
  imports: []
})
export class AuthModule {}
