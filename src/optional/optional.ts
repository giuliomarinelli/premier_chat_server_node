import { NoSuchElementException } from "src/exception_handling/no-such-element-exception"

// Ecco come ho implementato la classe Optional<T>
// Ci sono, come in Java, i metodi isPresent(), isEmpty() e get()

export class Optional<T> {

    private value: T | undefined | null

    constructor(value: T | undefined | null = undefined) {
        this.value = value
    }

    public isPresent(): boolean {
        return !!this.value // qui sfruttiamo giochi sintattici concisi caratteristici di TypeScript
    }

    public isEmpty(): boolean {
        return !this.value
    }

    public get(): T {
        if (this.isEmpty()) throw new NoSuchElementException("Trying to get a value from an empty Optional")
        return <T>this.value
    }

}
