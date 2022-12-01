import {Option} from "./option.js"
import {Thunk} from "./util.js"

export class Lazy<T> {
  private cachedResult: Option<T>

  constructor(public operation: Thunk<T>) {
    this.cachedResult = Option.none()
  }

  get value(): T {
    if (this.cachedResult.isNone())
      this.cachedResult = Option.some(this.operation())

    return this.cachedResult.unwrap()
  }
}
