import {Callback, CallbackWithParam, Unsafe} from "../util.js"
import {Maybe} from "./maybe.js"

export type Result<T> = Either<T, Error>

export type MayFail<T = Error> = Either<void, T>

export class Either<L, R> {
  static ok<T = void>(value: T): Result<T> {
    return Either.left(value)
  }

  static error<T = void>(message: string): Result<T> {
    return Either.right(new Error(message))
  }

  static pass(): MayFail {
    return Either.ok(undefined)
  }

  static passIf(condition: boolean, error: Error): MayFail {
    return condition ? Either.pass() : Either.right(error)
  }

  static assert(condition: boolean, errorMessage: string): MayFail {
    return Either.passIf(condition, new Error(errorMessage))
  }

  static left<T, U>(value: T): Either<T, U> {
    return new Either<T, U>(value, true)
  }

  static right<T, U>(value: U): Either<T, U> {
    return new Either<T, U>(value, false)
  }

  static try<T>(callback: Callback<Unsafe<T>>): Result<T> {
    try {
      return Either.left(callback())
    }
    catch (error) {
      if (error instanceof Error)
        return Either.right(error)
      else
        return Either.error("Uncaught exception thrown, which is not of type error!")
    }
  }

  public readonly value: L | R
  private readonly isLeftMarker: boolean

  private constructor(value: L | R, isLeftMarker: boolean) {
    this.value = value
    this.isLeftMarker = isLeftMarker
  }

  isLeft(): this is Either<L, never> {
    return this.isLeftMarker
  }

  isRight(): this is Either<never, R> {
    return !this.isLeft()
  }

  left(): Maybe<L> {
    return this.isLeft() ? Maybe.just(this.value) : Maybe.nothing()
  }

  leftOr(defaultValue: L): L {
    return this.left().unwrapOrDefault(defaultValue)
  }

  rightOr(defaultValue: R): R {
    return this.right().unwrapOrDefault(defaultValue)
  }

  right(): Maybe<R> {
    return this.isRight() ? Maybe.just(this.value) : Maybe.nothing()
  }

  mapLeft(callback: CallbackWithParam<L>): Either<L, R> {
    if (this.isLeft())
      callback(this.value)

    return this
  }

  mapRight(callback: CallbackWithParam<R>): Either<L, R> {
    if (this.isRight())
      callback(this.value)

    return this
  }

  orElseLeft(value: L): Either<L, R> {
    return Either.left(value)
  }

  orElseRight(value: R): Either<L, R> {
    return Either.right(value)
  }
}
