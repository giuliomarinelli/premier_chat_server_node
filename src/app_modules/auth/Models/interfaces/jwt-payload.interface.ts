import { UUID } from "crypto"
import { TokenType } from "../enums/token-type.enum"

export interface JwtPayload {

    iss: string
    sub: UUID
    jti: UUID
    typ: TokenType
    fgp?: string
    res: boolean
    iat: number
    exp: number
    
    
}