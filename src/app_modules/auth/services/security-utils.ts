import { SecurityCookieConfiguration, TotpConfiguration } from '../../../config/@types-config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomBytes } from 'crypto'
import { Encode } from '../Models/enums/encode.enum';
import speakeasy from 'speakeasy'
import { ConfigService } from '@nestjs/config';
import { TotpWrapper } from '../Models/output-dto/totp-wrapper.output.dto';
import { CookieOptions } from 'express';

@Injectable()
export class SecurityUtils {

    private totpConfig: TotpConfiguration

    private securityCookieConfig: SecurityCookieConfiguration

    private expiration: number

    constructor(private readonly configService: ConfigService) {
        this.totpConfig = configService.get<TotpConfiguration>("Totp")
        this.securityCookieConfig = configService.get<SecurityCookieConfiguration>("SecurityCookie"),
            this.expiration = configService.get<number>("Jwt.refreshToken.expiresInMs")
    }

    public generateSecret(bytes: number, encode: Encode): string {

        const buffer: Buffer = randomBytes(bytes)

        const hexPrefix: string = "0x"

        switch (encode) {

            case Encode.BASE_32:
                return speakeasy.generateSecret({ length: bytes }).base32

            case Encode.BASE_64:
                return buffer.toString(encode)

            case Encode.HEX:
                return hexPrefix + buffer.toString(encode)

        }

    }


    public obscureEmail(email: string): string {
        const i = email.indexOf("@")
        if (i === -1) throw new InternalServerErrorException()
        return email.charAt(0) + "*".repeat(i - 4) + email.slice(i - 2)
    }


    public obscurePhoneNumber(phoneNumber: string, phoneNumberPrefixLength: number): string {
        return phoneNumber.slice(0, phoneNumberPrefixLength) + "*".repeat(phoneNumber.length - phoneNumberPrefixLength) + phoneNumber.slice(-3)
    }


    public generateTotpSecret(): string {
        return this.generateSecret(this.totpConfig.bytes, Encode.BASE_32)
    }


    public generateTotp(base32Secret: string): TotpWrapper {

        const TOTP = speakeasy.totp({
            secret: base32Secret,
            encoding: 'base32',
            digits: this.totpConfig.digits,
            step: this.totpConfig.period,
            algorithm: "sha256"
        })

        const now = new Date()
        now.setMilliseconds(0)
        const generatedAt: number = now.getTime()
        const expiresAt: number = generatedAt + this.totpConfig.period * 1000

        return {
            TOTP,
            generatedAt,
            expiresAt
        }

    }

    public verifyTotp(totp: string, base32Secret: string): boolean {

        return speakeasy.totp.verify({
            secret: base32Secret,
            encoding: 'base32',
            token: totp,
            digits: this.totpConfig.digits,
            step: this.totpConfig.period,
            algorithm: 'sha256',
            window: 0
        });

    }

    public generateAuthenticationCookieOptions(session: boolean): CookieOptions {

        const { domain, httpOnly, path, sameSite, secure } = this.securityCookieConfig

        const opt: CookieOptions = {
            domain,
            httpOnly,
            path,
            sameSite,
            secure,
            maxAge: Date.now() + this.expiration
        }

        if (!session) return opt

        if (session) {

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { maxAge, ...optSession } = opt
            return optSession          

        }

    }

}
