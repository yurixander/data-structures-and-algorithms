import {ForwardIterable, ForwardIterator} from "./iterator/iterator.js"
import {Maybe} from "./monad/maybe.js"

export class StaticArray<T, TSize extends number> implements ForwardIterable<T> {
  static unit<T, TSize extends number>(values: T[], size: TSize): Maybe<StaticArray<T, TSize>> {
    if (values.length !== size || values.some(value => value === undefined))
      return Maybe.nothing()
    else
      return Maybe.just(new StaticArray(values, size))
  }

  private constructor(
    private readonly values: T[],
    private readonly size: TSize
  ) {
    //
  }

  iter(): ForwardIterator<T> {
    return ForwardIterator.lift(this.values)
  }
}
