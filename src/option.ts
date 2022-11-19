import { Util } from "./util"

type Falsy = undefined | null | false

export class Option<T> {
  static none<T>(): Option<T> {
    return null as any
  }

  static some<T>(value: T): Option<T> {
    return new Option(value)
  }

  static try<T>(result: T | Falsy): Option<T> {
    return !result ? Option.none() : Option.some(result)
  }

  static map2<A, B, C>(aOpt: Option<A>, bOpt: Option<B>, thunk: (a: A, b: B) => C): Option<C> {
    return aOpt.bind(a => bOpt.map(b => thunk(a, b)))
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

  unwrapOr(callback: Util.Thunk<T>): T {
    return this.value === null ? callback() : this.value
  }

  map<U>(callback: Util.ThunkWithParam<T, U>): Option<U> {
    return this.value === null ? Option.none() : Option.some(callback(this.value))
  }

  bind<U>(callback: Util.ThunkWithParam<T, Option<U>>): Option<U> {
    // TODO: Can't we base/abstract this off `map`?
    return this.value === null ? Option.none() : callback(this.value)
  }
}
