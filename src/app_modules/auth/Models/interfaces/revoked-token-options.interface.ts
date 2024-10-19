import { UUID } from "crypto";
import { TokenType } from "../enums/token-type.enum";

export interface IRevokedTokenOptions {

    jti?: UUID
    type?: TokenType

}