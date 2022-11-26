import { Thunk, ThunkWithParam } from "./util"

export type Result<T> = Either<T, Error>

export type MaybeOk = Either<void, Error>

export class Either<L, R> {
  static ok(): MaybeOk {
    return Either.left(undefined)
  }

  static error(message: string): MaybeOk {
    return Either.right(new Error(message))
  }

  static if(condition: boolean, error: Error): MaybeOk {
    return condition ? Either.ok() : Either.right(error)
  }

  static left<T, U>(value: T): Either<T, U> {
    return new Either<T, U>(value, true)
  }

  static right<T, U>(value: U): Either<T, U> {
    return new Either<T, U>(value, false)
  }

  static try<T>(thunk: Thunk<T | never>): Result<T> {
    try {
      return Either.left(thunk())
    }
    catch (error) {
      if (error instanceof Error)
        return Either.right(error)
      else
        return Either.right(new Error("Uncaught exception thrown, which is not of type error!"))
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

  leftOr(defaultValue: L): L {
    return this.isLeft ? this.left() : defaultValue
  }

  rightOr(defaultValue: R): R {
    return this.isRight ? this.right() : defaultValue
  }

  right(): R {
    if (this.isLeft)
      throw new Error("Value is not right")

    return this.value as R
  }

  mapLeft(callback: ThunkWithParam<L>): Either<L, R> {
    if (this.isLeft)
      callback(this.left())

    return this
  }

  mapRight(callback: ThunkWithParam<R>): Either<L, R> {
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
