import { Result } from "result-js";


/**
 * Performs safe integer division. Theoretically, both parameters would always be integers, this works better in a
 * language that throws an exception when dividing by zero or something like that.
 * See https://github.com/geode-sdk/result#example for a better C++ example, or just any Rust code.
 */
function integerDivision(a: number, b: number): Result<number> {
    if (b == 0) {
        return Result.err("You cannot divide a number by zero!");
    }

    return Result.ok(a / b);
}

let a = 42;
let b = 7;

let mySafeValue = integerDivision(a, b);

console.log("is ok? %s", mySafeValue.isOk()); // true
console.log("unwrap: %s", mySafeValue.unwrap()); // 6

b = 0;
mySafeValue = integerDivision(a, b);

console.log("is error? %s", mySafeValue.isErr()); // true
console.log("error value: %s", mySafeValue.unwrapErr()); // "You cannot divide a number by zero!"
console.log("unwrap: %s", mySafeValue.unwrapOr(123)); // 123
console.log("unwrap with no default: %s", mySafeValue.unwrap()); // throws UncheckedUnwrapException - don't do this!
