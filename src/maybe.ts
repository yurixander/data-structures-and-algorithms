import {Monad} from "./monad"
import {Callback, CallbackWithParam} from "./util"

type Falsy = undefined | null | false

export class Maybe<T> implements Monad<T> {
  static none<T>(): Maybe<T> {
    // CONSIDER: Making the `None` value a symbol instead of `null`
    return new Maybe<T>(null)
  }

  static some<T>(value: T): Maybe<T> {
    return new Maybe(value)
  }

  static try<T>(result: T | Falsy): Maybe<T> {
    return result === null
      || result === undefined
      || (typeof result === "boolean" && !result)
      ? Maybe.none()
      : Maybe.some(result)
  }

  static map2<A, B, C>(aOpt: Maybe<A>, bOpt: Maybe<B>, callback: (a: A, b: B) => C): Maybe<C> {
    // CONSIDER: Using the generalized `map2` implementation.
    return aOpt.bind(a => bOpt.map(b => callback(a, b)))
  }

  constructor(public value: T | null) {
    //
  }

  isNone(): boolean {
    return this.value === null
  }

  isSome(): boolean {
    return !this.isNone()
  }

  getOrDo(): T {
    return this.unwrapOrFailWith("Attempted to unwrap none value")
  }

  unwrapOrFailWith(message: string): T {
    if (this.value === null)
      throw new Error(message)

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
    return this.value === null ? Maybe.none() : Maybe.some(callback(this.value))
  }

  bind<U>(callback: CallbackWithParam<T, Maybe<U>>): Maybe<U> {
    // TODO: Can't we base/abstract this off `map`?
    return this.value === null ? Maybe.none() : callback(this.value)
  }

  do(callback: CallbackWithParam<T>): void {
    if (this.isSome())
      callback(this.getOrDo())
  }
}