export interface PasswordEncoder {

    encode(password: string): Promise<string>

    matches(password: string, hashedPassword: string): Promise<boolean>

}