import { UUID } from "crypto"
import { TokenType } from "../enums/token-type.enum"

export interface JwtPayload {

    iss: string
    sub: UUID
    jti: UUID
    typ: TokenType
    res: boolean
    iat: number
    exp: number

}