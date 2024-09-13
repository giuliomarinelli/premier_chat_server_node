import { Injectable } from '@nestjs/common'
import { RedisService } from 'src/app_modules/redis/services/redis.service'
import { UUID } from 'crypto'
import { IClient } from '../Models/client.interface'
import { IClientMap } from '../Models/client-map.interface'

@Injectable()
export class ClientService {
    private readonly CLIENT_MAP_KEY_PREFIX = 'client_map:'

    constructor(private readonly redisService: RedisService) { }

    // Aggiungi un nuovo client alla mappa
    async addClient(userId: UUID, clientId: UUID, client: IClient): Promise<void> {
        const clientMapKey = this.CLIENT_MAP_KEY_PREFIX + userId
        // Usa HSET per aggiungere o aggiornare un client nella mappa
        await this.redisService.hsetHash(clientMapKey, clientId.toString(), JSON.stringify(client))
    }

    // Rimuovi un client dalla mappa
    async removeClient(userId: UUID, clientId: string): Promise<void> {
        const clientMapKey = this.CLIENT_MAP_KEY_PREFIX + userId
        // Usa HDEL per rimuovere un client dalla mappa
        await this.redisService.hdelHash(clientMapKey, clientId.toString())
    }

    // Recupera la mappa dei client per un determinato utente
    async getClientMap(userId: UUID): Promise<IClientMap | null> {
        const clientMapKey = this.CLIENT_MAP_KEY_PREFIX + userId;
    
        // Supponiamo che tu voglia ottenere tutti i client per un determinato userId
        // Usa hgetall per ottenere tutte le chiavi e valori per questo hash
        const clientMap = await this.redisService.hgetallHash(clientMapKey);
    
        if (clientMap) {
            const clients = Object.values(clientMap).map((clientJson: string) => JSON.parse(clientJson));
            return { userId, clients };
        }
        return null;
    }

    // Recupera un client specifico per un determinato utente e clientId
    async getClient(userId: UUID, clientId: string): Promise<IClient | null> {
        const clientMapKey = this.CLIENT_MAP_KEY_PREFIX + userId
        const clientJson = await this.redisService.hgetHash(clientMapKey, clientId.toString())
        return clientJson ? JSON.parse(clientJson) : null
    }
}
