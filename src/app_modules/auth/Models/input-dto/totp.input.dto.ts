import { IsNotEmpty, IsString, Matches } from "class-validator";

export class TotpInputDto {

    @IsNotEmpty({ message: "'totp' field is required" })
    @IsString({ message: "'totp' field must be a string" })
    @Matches(/^\d{6}$/, { message: "Malformed 'totp' field. It must be a 6 digits numeric code" })
    totp: string

}