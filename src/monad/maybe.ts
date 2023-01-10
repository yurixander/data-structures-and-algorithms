import {Monad} from "./monad.js"
import {Callback, CallbackWithParam, Comparable, Unsafe} from "../util.js"

type Falsy = undefined | null | false

export class Maybe<T> implements Monad<T>, Comparable<Maybe<T>> {
  static nothing<T>(): Maybe<T> {
    // CONSIDER: Making the `None` value a symbol instead of `null`
    return new Maybe<T>(null)
  }

  static just<T>(value: T): Maybe<T> {
    return new Maybe(value)
  }

  static from<T>(result: T | Falsy): Maybe<T> {
    return result === null
      || result === undefined
      || (typeof result === "boolean" && !result)
      ? Maybe.nothing()
      : Maybe.just(result)
  }

  static map2<A, B, C>(aOpt: Maybe<A>, bOpt: Maybe<B>, callback: (a: A, b: B) => C): Maybe<C> {
    // CONSIDER: Using the generalized `map2` implementation.
    return aOpt.bind(a => bOpt.map(b => callback(a, b)))
  }

  constructor(public readonly value: T | null) {
    //
  }

  equals(other: Maybe<T>): boolean {
    // TODO: Will need to call a smarter compare utility function, defined in `Util` to compare objects by structure.
    return this.value === other.value
  }

  isNone(): boolean {
    return this.value === null
  }

  isSome(): boolean {
    return !this.isNone()
  }

  getOrDo(): Unsafe<T> {
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
    if (this.value === null)
      throw new Error(assumption)

    return this.value
  }

  unwrapOrDefault(defaultValue: T) {
    return this.value === null ? defaultValue : this.value
  }

  unwrapOr(callback: Callback<T>): T {
    return this.value === null ? callback() : this.value
  }

  unwrapOrElse<U>(otherValue: U): T | U {
    return this.value === null ? otherValue : this.value
  }

  map<U>(callback: CallbackWithParam<T, U>): Maybe<U> {
    return this.value === null ? Maybe.nothing() : Maybe.just(callback(this.value))
  }

  bind<U>(callback: CallbackWithParam<T, Maybe<U>>): Maybe<U> {
    // TODO: Can't we base/abstract this off `map`?
    return this.value === null ? Maybe.nothing() : callback(this.value)
  }

  do(callback: CallbackWithParam<T>): void {
    if (this.isSome())
      callback(this.getOrDo())
  }
}
