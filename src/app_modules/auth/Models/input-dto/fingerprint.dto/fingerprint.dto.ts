import { FingerprintDataDto } from "./fingerprint-data.dto";

export type FingerprintDto = Omit<FingerprintDataDto, 'type'>