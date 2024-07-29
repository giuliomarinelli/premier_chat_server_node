import { TotpWrapper } from "./totp-wrapper.output.dto";

export type TotpMetadataDto = Omit<TotpWrapper, 'TOTP'>