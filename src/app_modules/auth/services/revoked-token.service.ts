import { Injectable } from '@nestjs/common';
import { RevokedToken } from '../Models/sql-entities/revoked-token.entity';
import { Repository, EntityManager, DataSource } from 'typeorm';
import { UUID } from 'crypto';
import { Optional } from 'src/optional/optional';

@Injectable()
export class RevokedTokenService {

    private revokedTokenRepository: Repository<RevokedToken>

    constructor(private dataSource: DataSource) {
        this.revokedTokenRepository = this.dataSource.getRepository(RevokedToken)
    }

    // Gestione della transazione manuale
    public async findByJti(jti: UUID, manager?: EntityManager): Promise<Optional<RevokedToken>> {
        const repo = manager ? manager.getRepository(RevokedToken) : this.revokedTokenRepository;
        const result = await repo.findOneBy({ jti });

        return Optional.ofFalsable(result);
    }

    // Gestione della transazione manuale
    public async findByToken(token: string, manager?: EntityManager): Promise<Optional<RevokedToken>> {
        const repo = manager ? manager.getRepository(RevokedToken) : this.revokedTokenRepository;
        const result = await repo.findOneBy({ token });

        return Optional.ofFalsable(result);
    }

        public async revokeToken(token: string, jti?: UUID, type?: string): Promise<void> {
            await this.executeInTransaction(async (manager: EntityManager) => {
                await this.revokeTokenInTransaction(manager, token, jti);
            });
        }

    private async revokeTokenInTransaction(
        manager: EntityManager,
        token: string,
        jti: UUID | null = null
    ): Promise<void> {
        
        const revokedToken = new RevokedToken(token, jti)
        await manager.save(revokedToken)

    }

    // Metodo per eseguire le operazioni in una transazione
    private async executeInTransaction<T>(operation: (manager: EntityManager) => Promise<T>): Promise<T> {
        return await this.revokedTokenRepository.manager.transaction(operation);
    }
}
