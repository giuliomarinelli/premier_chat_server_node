import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify/types/request';
import * as ip from "ip"

@Injectable()
export class IpService {

    // Metodo per ottenere l'indirizzo IP del client
    public getClientIp(req: FastifyRequest): string {

        // Controlla l'header 'x-forwarded-for' per IP dietro proxy
        const forwardedIp: string = <string>req.headers['x-forwarded-for']
        return forwardedIp ? forwardedIp.split(',')[0].trim() : req.ip

    }

    // Metodo per il confronto fuzzy degli IP 
    // Usa una subnet /24 per confrontare solo i primi 3 ottetti degli IP
    public compareIps(ip1: string, ip2: string): boolean {

        const subnet1 = ip.cidrSubnet(ip1 + '/24')
        return subnet1.contains(ip2)

    }

    /* ESEMPIO DI UTILIZZO
        // Confronta gli IP con un confronto fuzzy sulla stessa subnet
  if (this.compareIps(ipStep1, ipStep2)) {
    console.log('Gli IP appartengono alla stessa subnet. Autenticazione accettata.');
    return true;
  } else {
    console.log('Gli IP non appartengono alla stessa subnet. Autenticazione negata.');
    return false;
  }
    */

}
