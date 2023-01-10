import {Maybe} from "./monad/maybe.js"

export class Int {
  static from(value: number): Maybe<Int> {
    if (!Number.isInteger(value))
      return Maybe.nothing()

    return Maybe.just(new Int(value))
  }

  private constructor(public readonly value: number) {
    //
  }

  get isPositive(): boolean {
    return this.value > 0
  }

  get bits(): number {
    return Math.ceil(Math.log2(this.value))
  }

  toString(): string {
    return this.value.toString()
  }
}
