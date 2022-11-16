import { Either, Result } from "./either";
import { Option } from "./option";
import { Util } from "./util";

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

    let from = Math.min(this.from, other.from)
    let to = Math.max(this.to, other.to)
    let result = new Interval(from, to)

    return Option.some(result)
  }

  difference(other: Interval): Option<Interval> {
    if (!this.overlapsWith(other))
      return Option.none()

    // TODO: Implement.
    Util.unimplemented()
  }

  intersection(other: Interval): Option<Interval> {
    // TODO: Implement.
    Util.unimplemented()
  }

  contains(other: Interval): boolean {
    return this.from <= other.from && this.to >= other.to
  }
}
