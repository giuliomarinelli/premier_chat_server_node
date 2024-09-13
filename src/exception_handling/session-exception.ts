export class SessionException extends Error {

    constructor(message?: string) {
        if (message) {
            super(message)
        } else {
            super()
        }
    }

}
