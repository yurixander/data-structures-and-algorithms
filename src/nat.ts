import {Maybe} from "./monad/maybe.js"
import {isProperNumber} from "./util.js"

export type Index = Nat

export class Nat {
  static from(value: number): Maybe<Nat> {
    return isProperNumber(value) && value >= 0
      ? Maybe.just(new Nat(value))
      : Maybe.nothing()
  }

  private constructor(public readonly value: number) {
    //
  }

  toString(): string {
    return this.value.toString()
  }
}
