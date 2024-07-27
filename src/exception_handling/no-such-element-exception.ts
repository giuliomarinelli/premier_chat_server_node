export class NoSuchElementException extends Error {

    constructor(message?: string) {
        if (message) {
            super(message)
        } else {
            super()
        }
    }

}
