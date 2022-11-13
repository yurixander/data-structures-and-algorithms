export namespace Math2 {
  export function factorialRecursiveNonTail(number: number): number {
    if (number < 0)
      throw new Error("Factorial of negative numbers is undefined")
    else if (number === 0)
      return 1

    return number * factorialRecursiveNonTail(number - 1)
  }

  export function factorialRecursive(number: number): number {
    if (number < 0)
      throw new Error("Factorial of negative numbers is undefined")

    let product = 1

    let go = (number: number): void => {
      if (number === 0)
        return

      product *= number

      return go(number - 1)
    }

    go(number)

    return product
  }

  export function factorialIterative(number: number): number {
    if (number < 0)
      throw new Error("Factorial of negative numbers is undefined")

    let product = 1

    while (number !== 0) {
      product *= number
      number--
    }

    return product
  }
}
