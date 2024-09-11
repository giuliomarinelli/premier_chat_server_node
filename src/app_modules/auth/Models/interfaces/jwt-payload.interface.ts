import { UUID } from "crypto"
import { TokenType } from "../enums/token-type.enum"
import { Fingerprints } from "./fingerprints.interface"

export interface JwtPayload {

    iss: string
    sub: UUID
    jti: UUID
    typ: TokenType
    fgp?: Fingerprints
    ip?: string
    res: boolean
    iat: number
    exp: number

    
}