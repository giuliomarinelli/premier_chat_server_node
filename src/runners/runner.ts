import { Logger } from "@nestjs/common"
import { Encode } from "src/app_modules/auth/Models/enums/encode.enum"
import { SecurityUtilsService } from "src/app_modules/auth/services/security-utils.service"

const runner = (securityUtils: SecurityUtilsService) => {

    const logger = new Logger("Runner")

    for (let i = 0; i < 8; i++) logger.log(`secret n. ${(i + 1)} = ${securityUtils.generateSecret(32, Encode.BASE_64)}`)

}

export default runner