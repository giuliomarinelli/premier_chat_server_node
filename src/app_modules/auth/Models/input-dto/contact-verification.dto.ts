import { IsNotEmpty, IsString } from "class-validator";

export class ContactVerificationDto {

    @IsNotEmpty({ message: "'contact' field is required" })
    @IsString({ message: `'contact' must be a string` })
    contact: string

}