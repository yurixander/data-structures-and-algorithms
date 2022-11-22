import { Util } from "./util"

export type Result<T> = Either<T, Error>

export type MaybeOk = Either<void, Error>

export class Either<L, R> {
  static ok(): MaybeOk {
    return Either.left(undefined)
  }

  static ifTrueThenOk(condition: boolean, error: Error): MaybeOk {
    return condition ? Either.ok() : Either.right(error)
  }

  static left<T, U>(value: T): Either<T, U> {
    return new Either<T, U>(value, true)
  }

  static right<T, U>(value: U): Either<T, U> {
    return new Either<T, U>(value, false)
  }

  static try<T>(thunk: Util.Thunk<T | never>): Result<T> {
    try {
      return Either.left(thunk())
    }
    catch (error) {
      return Either.right(error as Error)
    }
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

  orElseLeft(value: L): Either<L, R> {
    return Either.left(value)
  }

  orElseRight(value: R): Either<L, R> {
    return Either.right(value)
  }
}
