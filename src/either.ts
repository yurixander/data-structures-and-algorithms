import { Util } from "./util"

export type Result<T> = Either<T, Error>

export class Either<L, R> {
  static left<T, U>(value: T): Either<T, U> {
    return new Either<T, U>(value, true)
  }

  static right<T, U>(value: U): Either<T, U> {
    return new Either<T, U>(value, false)
  }

  private constructor(public value: L | R, public readonly isLeft: boolean) {
    //
  }

  get isRight(): boolean {
    return !this.isLeft
  }

  left(): L {
    if (!this.isLeft)
      throw new Error("Value is not left")

    return this.value as L
  }

  right(): R {
    if (this.isLeft)
      throw new Error("Value is not right")

    return this.value as R
  }

  mapLeft(callback: Util.ThunkWithParam<L>): Either<L, R> {
    if (this.isLeft)
      callback(this.left())

    return this
  }

  mapRight(callback: Util.ThunkWithParam<R>): Either<L, R> {
    if (this.isRight)
      callback(this.right())

    return this
  }
}
