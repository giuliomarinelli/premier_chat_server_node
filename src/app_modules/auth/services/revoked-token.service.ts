import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RevokedToken } from '../Models/sql-entities/revoked-token.entity';
import { Repository } from 'typeorm';
import { UUID } from 'crypto';
import { Optional } from 'src/optional/optional';

@Injectable()
export class RevokedTokenService {

    constructor(
        @InjectRepository(RevokedToken) private revokedTokenRepository: Repository<RevokedToken>
    ) { }

    public async findByJti(jti: UUID): Promise<Optional<RevokedToken>> {

        const result = await this.revokedTokenRepository.findOneBy({ jti })

        return result ? new Optional<RevokedToken>(result) : new Optional<RevokedToken>()

    }

    public async findByToken(token: string): Promise<Optional<RevokedToken>> {

        const result = await this.revokedTokenRepository.findOneBy({ token })

        return result ? new Optional<RevokedToken>(result) : new Optional<RevokedToken>()
        
    }

}
