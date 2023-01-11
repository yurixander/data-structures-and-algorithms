import {Monad} from "./monad.js"
import {Callback, CallbackWithParam, Comparable, Unsafe} from "../util.js"
import {Either} from "./either.js"

type Falsy = undefined | null | false

export type MayFail = Maybe<Error>

// TODO: To prevent problemss, `Maybe<undefined` should be statically forbidden.
/**
 * A monad encapsulating a value that may be present or absent.
 *
 * This is useful to represent the result of a computation that may fail,
 * or to represent the result of a computation that may return no value.
 *
 * @example Maybe.just(1).map(x => x + 1) // Maybe.just(2)
 * @example Maybe.nothing().map(x => x + 1) // Maybe.nothing()
 * @example Maybe.just(1).bind(x => Maybe.just(x + 1)) // Maybe.just(2)
 */
export class Maybe<T> implements Monad<T>, Comparable<Maybe<T>> {
  /**
   * Create a `Maybe` instance that represents the absence of a value.
   */
  static nothing<T>(): Maybe<T> {
    return new Maybe<T>(false)
  }

  /**
   * Create a `Maybe` instance with an underlying value.
   */
  static just<T>(value: T): Maybe<T> {
    return new Maybe(true, value)
  }

  /**
   * Create a `Maybe` instance from a value that may be *falsy*. If the
   * value is falsy, the instance will be `Maybe.nothing()`, otherwise
   * it will be `Maybe.just(value)`.
   *
   * @example Maybe.from(null) // Maybe.nothing()
   * @example Maybe.from(undefined) // Maybe.nothing()
   * @example Maybe.from(42) // Maybe.just(42)
   */
  static from<T>(result: T | Falsy): Maybe<T> {
    return result === null
      || result === undefined
      || (typeof result === "boolean" && !result)
      ? Maybe.nothing()
      : Maybe.just(result)
  }

  /**
   * Map the values of two `Maybe` instances using the given callback, only
   * if they both contain values.
   */
  static map2<A, B, C>(
    maybeA: Maybe<A>,
    maybeB: Maybe<B>,
    callback: (a: A, b: B) => C
  ): Maybe<C> {
    // CONSIDER: Using the generalized `map2` implementation.
    return maybeA.bind(a => maybeB.transform(b => callback(a, b)))
  }

  static ok(): MayFail {
    return Maybe.nothing()
  }

  static error(message: string): MayFail {
    return Maybe.just(new Error(message))
  }

  static okIf(condition: boolean, error: Error): MayFail {
    return condition ? Maybe.ok() : Maybe.just(error)
  }

  static assert(condition: boolean, errorMessage: string): MayFail {
    return Maybe.okIf(condition, new Error(errorMessage))
  }

  private constructor(
    private readonly isSomeMarker: boolean,
    public readonly value?: T,
  ) {
    //
  }

  equals(other: Maybe<T>): boolean {
    // TODO: Will need to call a smarter compare utility function, defined in `Util` to compare objects by structure.
    return this.value === other.value
  }

  equalsComparable(other: Maybe<T extends Comparable<T> ? T : never>): boolean {
    return this.value !== undefined
      && other.value !== undefined
      && other.value.equals(this.value)
  }

  isSome(): boolean {
    return this.isSomeMarker
  }

  isNone(): this is Maybe<never> {
    return !this.isSome()
  }

  do(): Unsafe<T> {
    return this.unwrap("Attempted to unwrap none value")
  }

  /**
   * Unsafely unwrap the underlying value (if any).
   *
   * ## Errors
   *
   * If the operation fails, an error with the given reason
   * as its message will be thrown.
   */
  unwrap(assumption: string): Unsafe<T> {
    if (this.value !== undefined)
      return this.value

    throw new Error(assumption)
  }

  unwrapOrDefault(defaultValue: T): T {
    return this.value !== undefined ? this.value : defaultValue
  }

  unwrapOr(callback: Callback<T>): T {
    return this.value !== undefined ? this.value : callback()
  }

  unwrapOrElse<U>(otherValue: U): Either<T, U> {
    return this.value !== undefined
      ? Either.left(this.value)
      : Either.right(otherValue)
  }

  transform<U>(callback: CallbackWithParam<T, U>): Maybe<U> {
    return this.value !== undefined
      ? Maybe.just(callback(this.value))
      : Maybe.nothing()
  }

  bind<U>(callback: CallbackWithParam<T, Maybe<U>>): Maybe<U> {
    // TODO: Can't we base/abstract this off `map`?
    return this.value !== undefined ? callback(this.value) : Maybe.nothing()
  }

  apply(callback: CallbackWithParam<T>): void {
    if (this.isSome())
      callback(this.do())
  }
}
