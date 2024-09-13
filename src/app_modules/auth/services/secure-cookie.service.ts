import { CookieSerializeOptions } from '@fastify/cookie';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from "crypto"
import { FastifyReply } from 'fastify';
import { SecureCookieIntegrityViolationException } from 'src/exception_handling/secure-cookie-integrity-violation-exception';

@Injectable()
export class SecureCookieService {

    private readonly secret: string

    // Ottimizzare meccanismo centralizzato per gestire in modo flessibile le opzioni dei cookie
    // da variabili d'ambiente o con parametri custom

    // private options: CookieSerializeOptions = {
    //     domain,
    //     httpOnly,
    //     path,
    //     sameSite,
    //     secure,
    //     maxAge: customMaxAge || Date.now() + this.expiration
    // }

    constructor(private readonly configService: ConfigService) {

        this.secret = this.configService.get<string>("SecurityCookie.secret")

    }

    private signCookie(value: string): string {

        const hmac = createHmac('sha256', this.secret)
        hmac.update(value)
        return `${value}.${hmac.digest('hex')}`

    }

    private verifyCookie(signedCookie: string): string | null {

        const [value, signature] = signedCookie.split('.')
        if (!signature) return null

        const hmac = createHmac('sha256', this.secret)
        hmac.update(value)
        const expectedSignature = hmac.digest('hex')

        if (signature !== expectedSignature) throw new SecureCookieIntegrityViolationException()

        return signature

    }

    public setSecureCookie(res: FastifyReply, name: string, value: string): void {

        const signedValue = this.signCookie(value);
        res.setCookie(name, signedValue, {
            httpOnly: false,  // Modifica in true se necessario
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

    }

}
