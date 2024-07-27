import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SecurityUtilsService } from './security-utils/security-utils.service';
import { SecurityUtilsModule } from './services/security-utils.module';
import { SecurityUtilsService } from './services/security-utils.service';

@Module({
  providers: [AuthService, SecurityUtilsService],
  imports: [SecurityUtilsModule]
})
export class AuthModule {}
