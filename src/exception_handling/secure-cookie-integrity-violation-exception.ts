export class SecureCookieIntegrityViolationException extends Error {

    constructor(message?: string) {
        if (message) {
            super(message)
        } else {
            super()
        }
    }

}
