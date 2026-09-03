# result-js

A simple result library for TypeScript, similar to Rust's Result error handling system. Featuring adequate JSDoc and
typing, and support for creating Results from potentially null values and Promises.

See [example.ts](./example.ts) for examples on how to use the library.

## Functions
View the JSDoc comments inside result.ts for usage and implementation details.

- static `Result#ok`
- static `Result#err`
- static `Result#fromPromise`
- static `Result#fromNull`
- `Result#isOk`
- `Result#isErr`
- `Result#unwrap`
- `Result#unwrapErr`
- `Result#unwrapOr`
- `Result#unwrapOrElse`
- `Result#match`
- `Result#flatten`
- `Result#forceOk`
- `Result#forceErr`
- `Result#log`
- `Result#logErr`
- `Result#inspect`
- `Result#inspectErr`

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
