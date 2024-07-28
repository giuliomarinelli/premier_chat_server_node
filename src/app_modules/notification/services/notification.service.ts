import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentMessageInfo } from 'nodemailer';
import { SmsConfiguration } from 'src/config/@types-config';
import { Twilio } from 'twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

@Injectable()
export class NotificationService {

    private readonly smsConfig: SmsConfiguration

    private smsClient: Twilio

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) {
        this.smsConfig = this.configService.get<SmsConfiguration>("Sms")
        this.smsClient = new Twilio(this.smsConfig.accountSID, this.smsConfig.authToken)
    }

    public async sendEmail<T>(to: string, subject: string, context: T, templatePath: string): Promise<SentMessageInfo> {

        return await this.mailerService.sendMail({
            to,
            subject,
            context,
            template: templatePath
        })

    }


    public async sendSms(to: string, body: string): Promise<MessageInstance> { 

        return await this.smsClient.messages.create({
            to,
            body
        })

    }

}
