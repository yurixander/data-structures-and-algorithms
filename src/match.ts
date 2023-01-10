import {Maybe} from "./monad/maybe.js"
import {Callback} from "./util.js"

export default function match<T, U>(subject: T): MatchBuilder<T, U> {
  return new MatchBuilder(subject)
}

// FIXME: TypeScript is not able to differentiate/infer the type for the resulting value.
class MatchBuilder<T, U> {
  private readonly subject: T
  private result: Maybe<U>

  constructor(subject: T) {
    this.subject = subject
    this.result = Maybe.nothing()
  }

  with(value: Partial<T>, then: Callback<U>): this {
    // TODO: Need specialized comparison for objects.
    if (this.result.isNone() && this.subject === value)
      this.result = Maybe.just(then())

    return this
  }

  otherwise(defaultValue: Callback<U>): U {
    return this.result.unwrapOr(defaultValue)
  }

  get(): Maybe<U> {
    return this.result
  }
}
