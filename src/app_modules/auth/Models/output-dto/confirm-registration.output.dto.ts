import { ConfirmOutputDto } from "./confirm.output.dto"

type ObscuredEmailWrapper = {

    obscuredEmail: string

}

export type ConfirmRegistrationOutputDto = ConfirmOutputDto & ObscuredEmailWrapper