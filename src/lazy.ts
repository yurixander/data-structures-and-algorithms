import {Maybe} from "./maybe.js"
import {Callback} from "./util.js"

export class Lazy<T> {
  private cachedResult: Maybe<T>

  constructor(public operation: Callback<T>) {
    this.cachedResult = Maybe.none()
  }

  get value(): T {
    if (this.cachedResult.isNone())
      this.cachedResult = Maybe.some(this.operation())

    return this.cachedResult.getOrDo()
  }
}
