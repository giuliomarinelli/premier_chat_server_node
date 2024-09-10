import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify/types/request';
import * as ip from "ip"

@Injectable()
export class IpService {

    // Metodo per ottenere l'indirizzo IP del client
    public getClientIp(req: FastifyRequest): string {

        const forwardedIp: string = <string>req.headers['x-forwarded-for']
        return forwardedIp ? forwardedIp.split(',')[0].trim() : req.ip

    }

    public compareIps(ip1: string, ip2: string): boolean {



    }

    

}
