import {Maybe} from "./monad/maybe.js"
import {BinaryOperation, UnaryOperation, addOp, divideOp, isProperNumber, multiplyOp, subtractOp} from "./util.js"

export type Nat = Int<false>

export type Index = Nat

export class Int<TSigned extends true | false = true> {
  static signed(value: number): Maybe<Int> {
    return isProperNumber(value)
      ? Maybe.just(new Int(value, true))
      : Maybe.nothing()
  }

  static unsigned(value: number): Maybe<Nat> {
    return value >= 0
      ? Maybe.just(new Int(value, false))
      : Maybe.nothing()
  }

  private constructor(
    public readonly value: number,
    private readonly phantomMarker: TSigned
  ) {
    //
  }

  get isPositive(): boolean {
    return this.value > 0
  }

  get bits(): number {
    return Math.ceil(Math.log2(this.value))
  }

  applyUnaryOp(op: UnaryOperation<number>): Maybe<Int<TSigned>> {
    const result = op(this.value)

    return isProperNumber(result)
      ? Maybe.just(new Int(result, this.phantomMarker))
      : Maybe.nothing()
  }

  applyBinaryOp(other: Int, op: BinaryOperation<number>): Maybe<Int<TSigned>> {
    const result = op(this.value, other.value)

    return isProperNumber(result)
      ? Maybe.just(new Int(result, this.phantomMarker))
      : Maybe.nothing()
  }

  add(other: Int): Maybe<Int<TSigned>> {
    return this.applyBinaryOp(other, addOp)
  }

  subtract(other: Int): Maybe<Int<TSigned>> {
    return this.applyBinaryOp(other, subtractOp)
  }

  multiply(other: Int): Maybe<Int<TSigned>> {
    return this.applyBinaryOp(other, multiplyOp)
  }

  divide(other: Int): Maybe<Int<TSigned>> {
    // NOTE: In JavaScript, division by zero yields `Infinity`, and
    // `0/0` yields `NaN`. Both special cases are covered by the `apply`
    // method.
    return this.applyBinaryOp(other, divideOp)
  }

  divideInt(other: Int): Maybe<Int<TSigned>> {
    return this.divide(other).transform(result => result.floor())
  }

  floor(): Int<TSigned> {
    return new Int(Math.floor(this.value), this.phantomMarker)
  }

  ceil(): Maybe<Int<TSigned>> {
    return this.applyUnaryOp(Math.ceil)
  }

  negate(): Int<TSigned extends true ? false : true> {
    // REVISE: Casting.
    return new Int(-this.value, !this.phantomMarker as TSigned extends true ? false : true)
  }

  abs(): Nat {
    return new Int(Math.abs(this.value), false)
  }

  toString(): string {
    return this.value.toString()
  }
}
