import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecureCookieService {

    private readonly secret: string

    constructor(private readonly configService: ConfigService) {

        

    }

}
