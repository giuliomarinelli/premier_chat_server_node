import { Injectable } from '@nestjs/common';
import { FingerprintDto } from '../Models/input-dto/fingerprint.dto/fingerprint.dto';
import { FingerprintDataDto } from '../Models/input-dto/fingerprint.dto/fingerprint-data.dto';
import { FingerPrintModelType } from '../Models/enums/fingerprint-model-type.enum';
import { SecurityUtils } from './security-utils';
import { Fingerprints } from "../Models/interfaces/fingerprints.interface"

@Injectable()
export class FingerprintService {

    constructor(private readonly securityUtils: SecurityUtils) { }

    public generateFingerprintDataDtoFromFingerprintDto(fingerprintDto: FingerprintDto): FingerprintDataDto {

        return {
            ...fingerprintDto,
            type: FingerPrintModelType.FingerprintDto
        }

    }

    public async generateFingerprintsFromFingerprintDataDto(fingerprintDataDto: FingerprintDataDto): Promise<Fingerprints> {

        const { type, ...fingerprintDto } = fingerprintDataDto

        const { audio, canvas, fonts, hardware, locales, math, permissions, plugins, screen, system, webgl } = fingerprintDto

        return {
            audioHash: await this.securityUtils.generateSha256Hash(JSON.stringify(audio)),
            canvasHash: await this.securityUtils.generateSha256Hash(JSON.stringify(canvas)),
            fontsHash: await this.securityUtils.generateSha256Hash(JSON.stringify(fonts)),
            hardwareHash: await this.securityUtils.generateSha256Hash(JSON.stringify(hardware)),
            localesHash: await this.securityUtils.generateSha256Hash(JSON.stringify(locales)),
            permissionsHash: await this.securityUtils.generateSha256Hash(JSON.stringify(permissions)),
            pluginsHash: await this.securityUtils.generateSha256Hash(JSON.stringify(plugins)),
            screenHash: await this.securityUtils.generateSha256Hash(JSON.stringify(screen)),
            systemHash: await this.securityUtils.generateSha256Hash(JSON.stringify(system)),
            webglHash: await this.securityUtils.generateSha256Hash(JSON.stringify(webgl)),
            mathHash: await this.securityUtils.generateSha256Hash(JSON.stringify(math)),
            type: FingerPrintModelType.Fingerprints
        }
    }

}
