import { TokenPairType } from "../enums/token-pair-type.enum"

export interface TokenPair {

    accessToken: string
    refreshToken: string
    type: TokenPairType

}