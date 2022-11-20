import { Either, Result } from "./either"

export namespace Math2 {
  export function factorialRecursiveNonTail(number: number): Result<number> {
    if (number < 0)
      return Either.right(new Error("Factorial of negative numbers is undefined"))
    else if (number === 0)
      return Either.left(1)

    return factorialRecursiveNonTail(number - 1)
      .mapLeft(result => number * result)
  }

  export function factorialRecursive(number: number): Result<number> {
    if (number < 0)
      return Either.right(new Error("Factorial of negative numbers is undefined"))

    let product = 1

    // BUG: Still overflowing the stack for some reason.
    const go = (number: number): void => {
      if (number === 0)
        return

      product *= number

      return go(number - 1)
    }

    go(number)

    return Either.left(product)
  }

  export function factorialIterative(number: number): Result<number> {
    if (number < 0)
      return Either.right(new Error("Factorial of negative numbers is undefined"))

    let product = 1

    while (number !== 0) {
      product *= number
      number--
    }

    return Either.left(product)
  }
}
