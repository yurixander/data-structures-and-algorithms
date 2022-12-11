export interface Monoid<T> {
  readonly identity: T

  op(a: T, b: T): T
}

export function combine<T>(monoid: Monoid<T>, values: T[]): T {
  // Initialize the result to the monoid's identity element.
  let result = monoid.identity

  // Iterate over the values in the array and combine them using the
  // monoid's binary operation.
  for (const value of values) {
    result = monoid.op(result, value)
  }

  // Return the result.
  return result
}

export class AdditiveMonoid implements Monoid<number> {
  identity = 0

  op(a: number, b: number): number {
    return a + b
  }
}

export class MultiplicativeMonoid implements Monoid<number> {
  readonly identity = 1

  op(a: number, b: number): number {
    return a * b
  }
}

export class StringMonoid implements Monoid<string> {
  readonly identity = ""

  op(a: string, b: string): string {
    return a + b
  }
}

export class ArrayMonoid<T> implements Monoid<T[]> {
  readonly identity: T[] = []

  op(a: T[], b: T[]): T[] {
    // TODO: Doesn't this break the principle of order doesn't matter?
    return a.concat(b)
  }
}

// export class LinkedListMonoid<T> implements Monoid<SinglyLinkedList<T>> {
//   identity: SinglyLinkedList<T>

//   constructor(identity)
// }
