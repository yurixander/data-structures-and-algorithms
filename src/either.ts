export type Result<T> = Either<T, Error>

export class Either<T, U> {
  static left<T, U>(value: T): Either<T, U> {
    return new Either<T, U>(value, true)
  }

  static right<T, U>(value: U): Either<T, U> {
    return new Either<T, U>(value, false)
  }

  private constructor(public value: T | U, public readonly isLeft: boolean) {
    //
  }

  left(): T {
    if (!this.isLeft)
      throw new Error("Value is not left")

    return this.value as T
  }

  right(): U {
    if (this.isLeft)
      throw new Error("Value is not right")

    return this.value as U
  }
}
