import {Maybe} from "./monad/maybe.js"
import {Callback} from "./util.js"

type Args = unknown[]

export class Lazy<T> {
  static lift<T>(operation: Callback<T>): Lazy<T> {
    return new Lazy(operation)
  }

  private cachedResult: Maybe<T>

  private constructor(public operation: Callback<T>) {
    this.cachedResult = Maybe.nothing()
  }

  get value(): T {
    if (this.cachedResult.isNone())
      this.cachedResult = Maybe.just(this.operation())

    return this.cachedResult.getOrDo()
  }
}

export class Memoized<T> {
  private readonly cache: Map<number, T> = new Map()

  constructor(private readonly fn: (...args: Args) => T) {
    //
  }

  getOrSet(key: number, ...args: Args): T {
    if (!this.cache.has(key))
      this.cache.set(key, this.fn(...args))

    return this.cache.get(key)!
  }

  getOrSetDefault(...args: Args): T {
    return this.getOrSet(0, ...args)
  }
}
