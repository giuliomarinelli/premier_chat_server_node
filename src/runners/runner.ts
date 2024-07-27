/* eslint-disable @typescript-eslint/no-unused-vars */
import { Logger } from "@nestjs/common"
import { Encode } from "src/app_modules/auth/Models/enums/encode.enum"
import { SecurityUtils } from "src/app_modules/auth/services/security-utils"

const runner = (securityUtils: SecurityUtils) => {

    // const logger = new Logger("Runner")

    // for (let i = 0; i < 8; i++) logger.log(`secret n. ${(i + 1)} = ${securityUtils.generateSecret(32, Encode.BASE_64)}`)

}

export default runner