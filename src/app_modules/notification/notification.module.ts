import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';

@Module({
  providers: [NotificationService]
})
export class NotificationModule {}
