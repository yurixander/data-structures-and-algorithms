import { Callback } from "./common"
import { Option } from "./option"

type Entry<T> = [T, number]

type Comparator<T> = (a: T, b: T) => boolean

export namespace Algorithm {
  export function strictEqualityComparator<T>(a: T, b: T): boolean {
    return a === b
  }

  export function weakEqualityComparator<T>(a: T, b: T): boolean {
    return a == b
  }

  export function greaterThanComparator<T>(a: T, b: T): boolean {
    return a > b
  }

  export function lessThanComparator<T>(a: T, b: T): boolean {
    return a < b
  }

  export function filterByFrequency<T>(
    array: T[],
    frequency: number,
    comparator: Comparator<number> = strictEqualityComparator
  ): Entry<T>[] {
    let frequencies = new Map<T, number>()
    let indexes = new Map<T, number>()

    for (const [index, value] of array.entries()) {
      if (!frequencies.has(value))
        frequencies.set(value, 1)

      indexes.set(value, index)
    }

    return Array
      .from(frequencies)
      .filter(([, actualFrequency]) => comparator(actualFrequency, frequency))
      .map(([value]) => [value, indexes.get(value)!])
  }

  export function filterDistinct<T>(array: T[]): Entry<T>[] {
    return filterByFrequency(array, 1)
  }

  export function filterNonDistinct<T>(array: T[]): Entry<T>[] {
    return filterByFrequency(array, 1, Algorithm.greaterThanComparator)
  }

  export function containsOnlyUniqueElements<T>(array: T[]): boolean {
    let seen = new Set<T>()

    for (const value of array)
      if (seen.has(value))
        return false
      else
        seen.add(value)

    return true
  }

  export function binarySearchIterative<T>(array: T[], value: T): Option<number> {
    let low = 0
    let high = array.length - 1

    while (low !== high) {
      let middle = (low + high) / 2

      if (array[middle] === value)
        return Option.some(middle)
      else if (array[middle] < value)
        low = middle + 1
      else
        high = middle - 1
    }

    return Option.none()
  }

  export function makeArray<T>(size: number, callback: Callback<T>): T[] {
    let array = new Array<T>(size)

    for (let i = 0; i < size; i++)
      array[i] = callback()

    return array
  }
}
