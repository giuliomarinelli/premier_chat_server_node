export class Optional<T> {

    private value: T

    constructor(value: T = undefined) {
        this.value = value
    }

    public isPresent(): boolean {
        return !!this.value
    }

    public isEmpty(): boolean {
        return !this.value
    }

}
