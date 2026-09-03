/**
 * An exception which gets thrown if a Result is unwrapped with Result#unwrap, but has an error value, or if a Result
 * gets unwrapped with Result#unwrapErr, but contains a value.
 */
class UncheckedUnwrapException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UncheckedUnwrapException";
    }
};

/**
 * A result, similar to Rust's error handling. Can be either ok (Result#isOk) or error (Result#isErr), and should be
 * unwrapped with either Result#unwrap or Result#unwrapErr depending on the contents.
 *
 * An UncheckedUnwrapException is thrown if a Result which contains an error is unwrapped. Please do not unwrap Results
 * unchecked!! They are Results for a reason!!
 */
export class Result<T = void, E = string> {
    private readonly ok: boolean;
    private readonly value!: T;
    private readonly error!: E;

    /**
     * Creates a successful Result with no data.
     * @returns A successful Result with no data.
     */
    static ok(): Result<void, never>;

    /**
     * Creates a successful Result with the data provided. This can be safely unwrapped with Result#unwrap.
     * @param data The data in the Result.
     * @returns A successful Result with the data passed in.
     */
    static ok<T>(data: T): Result<T, never>;

    static ok<T>(data?: T): Result<T, never> {
        return new Result<T, never>(true, data as T, undefined as never);
    }

    /**
     * Creates an unsuccessful Result with the error provided. This can be safely unwrapped with Result#unwrapErr.
     * @param error The error in the Result.
     * @returns An unsuccessful Result with the error passed in.
     */
    static err<E>(error: E): Result<never, E> {
        return new Result<never, E>(false, undefined as never, error);
    }

    /**
     * Creates a successful or unsuccessful Result depending on whether the promise was resolved or rejected.
     * @param promise The promise to listen for rejection or success from.
     * @returns A Result, a successful Result if the Promise was resolved, or an unsuccessful Result if the Promise was
     *          rejected.
     */
    static async fromPromise<T>(promise: Promise<T>): Promise<Result<T, unknown>> {
        try {
            let res = await promise;
            return Result.ok(res);
        } catch(err) {
            return Result.err(err);
        }
    }

    /**
     * Creates a successful or unsuccessful Result depending on whether the passed in parameter was either null or
     * undefined or not.
     * @param maybeNull A value which may be null or not.
     * @param error An error value which is passed as the error if the maybeNull parameter was null or undefined.
     * @returns A successful or unsuccessful Result depending on the maybeNull parameter.
     */
    static fromNull<T, E>(maybeNull: T | null | undefined, error: E) {
        // null or undefined, in this case
        if (maybeNull == null) {
            return Result.err(error);
        } else {
            return Result.ok(maybeNull);
        }
    }

    /**
     * @param isOk Whether the Result holds okValue or errValue.
     * @param okValue The value in the Result, or undefined if there is none.
     * @param errValue The error in the Result, or undefined if there is none.
     */
    private constructor(isOk: boolean, okValue: T, errValue: E) {
        this.ok = isOk;
        this.value = okValue;
        this.error = errValue;
    }

    /**
     * Checks whether the Result is successful or not.
     * @returns Whether the Result is okay, and can be unwrapped with Result#unwrap.
     */
    isOk(): boolean { return this.ok; }

    /**
     * Checks whether the Result is unsuccessful or not.
     * @returns Whether the Result contains an error, and can be unwrapped with Result#unwrapErr.
     */
    isErr(): boolean { return !this.ok; }

    /**
     * Unwraps and returns the value inside the Result, if it was successful. Do not call if Result#isErr returns true,
     * or if Result#isOk returns false! That will throw an UncheckedUnwrapException.
     * @returns The value contained in the Result.
     * @throws {UncheckedUnwrapException} if the Result contains an error value.
     */
    unwrap(): T {
        if (this.isErr()) {
            throw new UncheckedUnwrapException(`Called unwrap on an Err Result: ${String(this.error)}!`);
        } else {
            return this.value;
        }
    }

    /**
     * Unwraps and returns the error inside the Result, if it was unsuccessful. Do not call if Result#isOk returns true,
     * or if Result#isErr returns false! That will throw an UncheckedUnwrapException.
     * @returns The error contained in the Result.
     * @throws {UncheckedUnwrapException} if the Result contains a success value.
     */
    unwrapErr(): E {
        if (this.isOk()) {
            throw new UncheckedUnwrapException(`Called unwrapErr on an Ok Result: ${this.value}!`);
        } else {
            return this.error;
        }
    }

    /**
     * Unwraps and returns the value inside the Result, if it was successful. Unlike Result#unwrap, this returns a
     * fallback value if the Result contains an error, so is safe to call completely unchecked.
     * @param fallback The fallback value, if the Result contains an error.
     * @returns The value contained in the Result, or the fallback.
     */
    unwrapOr(fallback: T): T {
        if (this.isErr()) {
            return fallback;
        } else {
            return this.value;
        }
    }

    /**
     * Similar to Result#unwrap, but calls a callback function on error, and returns that as a value, if unsuccessful.
     * @param fallback The fallback callback (hey, that rhymes!), if the Result contains an error.
     * @returns The value contained in the Result, or the fallback.
     */
    unwrapOrElse(fallback: (error: E) => T): T {
        if (this.isErr()) {
            return fallback(this.error);
        } else {
            return this.value;
        }
    }

    /**
     * Calls either okCallback or errCallback with the value or error if the Result contains a value or error,
     * respectively.
     * @param okCallback The callback that gets called with the value inside the Result, if the Result is successful.
     * @param errCallback The callback that gets called with the error inside the Result, if the Result is unsuccessful.
     */
    match<R>(okCallback: (value: T) => R, errCallback: (error: E) => R): R {
        if (this.isOk()) {
            return okCallback(this.value);
        } else {
            return errCallback(this.error);
        }
    }

    /**
     * Converts a Result<Result<T, E>, E> to a Result<T, E>, useful if you have nested results for whatever reason.
     * @returns An unnested Result.
     */
    flatten<T, E>(this: Result<Result<T, E>, E>): Result<T, E> {
        if (this.isOk()) {
            return this.unwrap();
        } else {
            return this as Result<never, E>;
        }
    }

    /**
     * Converts a Result<T, E> to a Result<T, never>. The equivalent of running Result.ok(result.unwrap()), so this may
     * throw an UncheckedUnwrapException!
     * @returns A Result where E is set to never.
     */
    forceOk(): Result<T, never> {
        if (this.isErr()) {
            throw new UncheckedUnwrapException(`Called forceOk on an Err Result: ${this.error}!`);
        } else {
            return this as unknown as Result<T, never>;
        }
    }

    /**
     * Converts a Result<T, E> to a Result<never, E>. The equivalent of running Result.err(result.unwrapErr()), so this
     * may throw an UncheckedUnwrapException!
     * @returns A Result where T is set to never.
     */
    forceErr(): Result<never, E> {
        if (this.isOk()) {
            throw new UncheckedUnwrapException(`Called forceErr on an Ok Result: ${this.value}!`);
        } else {
            return this as unknown as Result<never, E>;
        }
    }
};
