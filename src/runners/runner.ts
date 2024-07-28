/* eslint-disable @typescript-eslint/no-unused-vars */
import { UUID } from 'crypto';
import { Logger } from "@nestjs/common"
import { Encode } from "src/app_modules/auth/Models/enums/encode.enum"
import { TokenType } from "src/app_modules/auth/Models/enums/token-type.enum"
import { JwtUtils } from "src/app_modules/auth/services/jwt-utils"
import { SecurityUtils } from "src/app_modules/auth/services/security-utils"
import { v4 as uuidv4 } from 'uuid'

const runner = async (jwtUtils: JwtUtils) => {

    // const logger = new Logger("Runner")

    // for (let i = 0; i < 8; i++) logger.log(`secret n. ${(i + 1)} = ${securityUtils.generateSecret(32, Encode.BASE_64)}`)

    // const refreshToken = await jwtUtils.generateToken(<UUID>uuidv4(), TokenType.REFRESH_TOKEN, false)

    // console.log(refreshToken)

    // console.log(await jwtUtils.extractPayload(refreshToken, TokenType.REFRESH_TOKEN, false))

    // jwtUtils.extractHttpTokensFromContext("COOKIE")

}

export default runner