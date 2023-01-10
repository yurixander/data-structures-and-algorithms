import {Either, Result} from "./monad/either.js"
import {Maybe} from "./monad/maybe.js"
import {unimplemented} from "./util.js"

export class Interval {
  static unit(from: number, to: number): Result<Interval> {
    if (from > to)
      return Either.error("Interval range is invalid")

    return Either.left(new Interval(from, to))
  }

  private constructor(public from: number, public to: number) {
    //
  }

  overlapsWith(other: Interval): boolean {
    return this.from <= other.to && other.to <= this.from
  }

  contains(other: Interval): boolean {
    return this.from <= other.from && this.to >= other.to
  }

  union(other: Interval): Maybe<Interval> {
    if (!this.overlapsWith(other))
      return Maybe.nothing()

    const from = Math.min(this.from, other.from)
    const to = Math.max(this.to, other.to)

    return Maybe.just(new Interval(from, to))
  }

  difference(other: Interval): Maybe<Interval> {
    if (!this.overlapsWith(other))
      return Maybe.nothing()

    // TODO: Implement.
    unimplemented()
  }

  intersection(other: Interval): Maybe<Interval> {
    // TODO: Implement.
    unimplemented()
  }

  isDisjointFrom(other: Interval): boolean {
    // TODO: Implement.
    unimplemented()
  }
}
