import { SinglyLinkedList } from "./singlyLinkedList.js"

export interface Monoid<T> {
  identity: T

  apply(a: T, b: T): T
}

export class AdditiveMonoid implements Monoid<number> {
  identity: number = 0

  apply(a: number, b: number): number {
    return a + b
  }
}

export class MultiplicativeMonoid implements Monoid<number> {
  identity: number = 1

  apply(a: number, b: number): number {
    return a * b
  }
}

export class StringMonoid implements Monoid<string> {
  identity: string = ""

  apply(a: string, b: string): string {
    return a + b
  }
}

export class ArrayMonoid<T> implements Monoid<T[]> {
  identity: T[] = []

  apply(a: T[], b: T[]): T[] {
    // TODO: Doesn't this break the principle of order doesn't matter?
    return a.concat(b)
  }
}

// export class LinkedListMonoid<T> implements Monoid<SinglyLinkedList<T>> {
//   identity: SinglyLinkedList<T>

//   constructor(identity)
// }
