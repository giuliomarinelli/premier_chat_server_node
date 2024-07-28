import { Transform } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from "class-validator";
import { Gender } from "../enums/gender.enum";

export class UserPostInputDto {

    @IsNotEmpty({ message: `'firstName' is required` })
    @IsString({ message: `'firstName' must be a string` })
    firstName: string

    @IsNotEmpty({ message: `'lastName' is required` })
    @IsString({ message: `'lastName' must be a string` })
    lastName: string

    @IsNotEmpty({ message: `'lastName' is required` })
    @IsInt({ message: `'dateOfBirth' must be a 64-bit integer number` })
    @Min(-2208988800000, { message: `'dateOfBirth' must be major than -2208988800000` })
    dateOfBirth: number

    @IsNotEmpty({ message: `'gender' is required` })
    @IsString({ message: `'gender' must be a string` })
    @Matches(/^(MALE|FEMALE|NOT[ _\-]SPECIFIED)$/i, { message: `Malformed 'gender' field` })
    @Transform(({ value }) => {
        return Gender[value.toUpperCase() as keyof typeof Gender];
    })
    gender: Gender

    @IsNotEmpty({ message: `'username' is required` })
    @IsString({ message: `'username' must be a string` })
    @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{1,18}[a-zA-Z0-9])?$/, { message: `Malformed 'username'` })
    @Min(3, { message: `'username' must be long at least 3 characters` })
    @Max(25, { message: `'username' must be long no more than 25 characters` })
    username: string

    /* [a-zA-Z0-9]: Il primo carattere deve essere una lettera o un numero.
        (?:...): Un gruppo non catturante per il resto della stringa.
        [a-zA-Z0-9._-]{1,18}: Permette lettere, numeri, punti, trattini e underscore, con lunghezza tra 1 e 18 caratteri.
        [a-zA-Z0-9]: L'ultimo carattere deve essere una lettera o un numero.
        ?: Il gruppo non catturante è opzionale (permette username di lunghezza 1).
     */

    @IsNotEmpty({ message: `'email' is required` })
    @IsString({ message: `'email' must be a string` })
    @IsEmail()
    email: string

    /*
        (?=.*[a-z]): Almeno una lettera minuscola.
        (?=.*[A-Z]): Almeno una lettera maiuscola.
        (?=.*\d): Almeno un numero.
        (?=.*[@$!%*?&]): Almeno un carattere speciale.
        [A-Za-z\d@$!%*?&]{8,20}: Consente lettere maiuscole e minuscole, numeri e caratteri speciali, con una lunghezza compresa tra 8 e 20 caratteri.
    */

    @IsNotEmpty({ message: `'password' is required` })
    @IsString({ message: `'password' must be a string` })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/, { message: `Malformed 'password' field` })
    password: string

    @IsOptional()
    @IsString({ message: `'phoneNumberPrefix' must be a string` })
    @Matches(/^\+\d{1,4}$/, { message: `Malformed 'phoneNumberPrefix' field` })
    phoneNumberPrefix: string

    @IsOptional()
    @IsString({ message: `'phoneNumberBody' must be a string` })
    @Matches(/^\d{4,15}$/, { message: `Malformed 'phoneNumberBody' field` })
    phoneNumberBody: string


}