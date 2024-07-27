import { Injectable } from '@nestjs/common';
import { PasswordEncoder } from '../Models/interfaces/password-encoder.interface';
import * as argon2 from "argon2"

@Injectable()
export class Argon2PasswordEncoder implements PasswordEncoder {

    public async encode(password: string): Promise<string> {
        return await argon2.hash(password)
    }

    public async matches(password: string, hashedPassword: string): Promise<boolean> {
        return await argon2.verify(hashedPassword, password)
    }

}
