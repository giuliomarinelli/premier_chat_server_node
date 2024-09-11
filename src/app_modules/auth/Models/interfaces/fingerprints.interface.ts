import { FingerPrintModelType } from "../enums/fingerprint-model-type.enum"

export interface Fingerprints {

    type: FingerPrintModelType
    audioHash: string
    canvasHash: string
    fontsHash: string
    hardwareHash: string
    localesHash: string
    permissionsHash: string
    pluginsHash: string
    screenHash: string
    systemHash: string
    webglHash: string
    mathHash: string

}