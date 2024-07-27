import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto'
import { Encode } from '../Models/enums/encode.enum';
import speakeasy from 'speakeasy'

@Injectable()
export class SecurityUtils {

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

}
