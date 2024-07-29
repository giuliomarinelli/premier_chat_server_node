import { ConfirmOutputDto } from "./confirm.output.dto"

type ObscuredContactsWrapper = {

    obscuredEmail?: string
    obscuredPhoneNumber?: string

}

export type ConfirmLoginOutputDto = ConfirmOutputDto & ObscuredContactsWrapper