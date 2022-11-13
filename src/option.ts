import { Callback, CallbackWithParam } from "./common"

export class Option<T> {
  static none<T>(): Option<T> {
    return null as any
  }

  static some<T>(value: T): Option<T> {
    return new Option(value)
  }

  static try<T>(result: T | undefined): Option<T> {
    if (result === undefined)
      return Option.none()

    return Option.some(result)
  }

  constructor(public value: T | null) {
    //
  }

  isNone(): boolean {
    return this.value === null
  }

  isSome() {
    return !this.isNone()
  }

  unwrap(): T {
    return this.unwrapOrFail("Attempted to unwrap none value")
  }

  unwrapOrFail(message: string): T {
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

  map<U>(callback: CallbackWithParam<T, U>): Option<U> {
    return this.value === null ? Option.none() : Option.some(callback(this.value))
  }

  then<U>(callback: CallbackWithParam<T, Option<U>>): Option<U> {
    // TODO: Can't we base/abstract this off `map`?
    return this.value === null ? Option.none() : callback(this.value)
  }
}
