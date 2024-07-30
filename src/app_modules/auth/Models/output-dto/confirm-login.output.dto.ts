import { ConfirmOutputDto } from "./confirm.output.dto"
import { TotpMetadataDto } from "./totp-metadata.dto.output"

type ObscuredContactsWrapper = {

    obscuredEmail?: string
    obscuredPhoneNumber?: string

}

export type ConfirmLoginOutputDto = ConfirmOutputDto & ObscuredContactsWrapper

export type ConfirmOutputWithObscuredContactAndTotpMetadata = ConfirmOutputDto & ObscuredContactsWrapper & TotpMetadataDto