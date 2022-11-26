import { Either, Result } from "./either.js"
import { Option } from "./option.js"
import { unimplemented } from "./util.js"

export class Interval {
  static unit(from: number, to: number): Result<Interval> {
    if (from > to)
      return Either.right(new Error("Interval range is invalid"))

    return Either.left(new Interval(from, to))
  }

  private constructor(public from: number, public to: number) {
    //
  }

  overlapsWith(other: Interval): boolean {
    return this.from <= other.to && other.to <= this.from
  }

  union(other: Interval): Option<Interval> {
    if (!this.overlapsWith(other))
      return Option.none()

    const from = Math.min(this.from, other.from)
    const to = Math.max(this.to, other.to)

    return Option.some(new Interval(from, to))
  }

  difference(other: Interval): Option<Interval> {
    if (!this.overlapsWith(other))
      return Option.none()

    // TODO: Implement.
    unimplemented()
  }

  intersection(other: Interval): Option<Interval> {
    // TODO: Implement.
    unimplemented()
  }

  contains(other: Interval): boolean {
    return this.from <= other.from && this.to >= other.to
  }
}
