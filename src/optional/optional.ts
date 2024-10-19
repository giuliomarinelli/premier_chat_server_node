export class Optional<T> {

    private constructor(private readonly value: T | null | undefined) { }

    // Static method to create an Optional from a non-falsy value
    public static of<T>(value: T): Optional<T> {
        if (value === null || value === undefined) {
            throw new Error('FalsyPointerException: value cannot be null or undefined');
        }
        return new Optional(value);
    }

    // Static method to create an Optional from a potentially falsy value
    public static ofFalsable<T>(value: T | null | undefined): Optional<T> {
        return new Optional(value);
    }

    // Return the contained value if present, or throw an error if absent
    public get(): T {
        if (this.value === null || this.value === undefined) {
            throw new Error('NoSuchElementException: value is not present');
        }
        return this.value;
    }

    // Return the contained value if present, or a default value if absent
    public orElse(defaultValue: T): T {
        return this.value !== null && this.value !== undefined ? this.value : defaultValue;
    }

    // Return the contained value if present, or null if absent
    public orElseNull(): T | null {
        return this.value !== null && this.value !== undefined ? this.value : null;
    }

    // Check if a value is present
    public isPresent(): boolean {
        return this.value !== null && this.value !== undefined;
    }

    // Apply a function to the contained value if present
    public ifPresent(callback: (value: T) => void): void {
        if (this.isPresent()) {
            callback(this.value as T);
        }
    }

    // Filter the value based on a predicate
    public filter(predicate: (value: T) => boolean): Optional<T> {
        if (this.isPresent() && predicate(this.value as T)) {
            return this;
        }
        return new Optional<T>(null);
    }

    // Map the contained value to a new Optional
    public map<U>(mapper: (value: T) => U): Optional<U> {
        if (this.isPresent()) {
            return Optional.ofFalsable(mapper(this.value as T));
        }
        return new Optional<U>(null);
    }

}
