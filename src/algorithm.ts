import {Maybe} from "./maybe.js"
import {Callback} from "./util.js"

type Entry<T> = [T, number]

export enum ComparisonOperation {
  LessThan,
  LessThanOrEqualTo,
  EqualTo,
  GreaterThan,
  GreaterThanOrEqualTo,
  NotEqualTo
}

export type Comparator<T> =
  (a: T, b: T, operation: ComparisonOperation) => boolean

type PredefinedComparator<T> = (a: T, b: T) => boolean

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

// REVIEW: Any way to accept `Iterable<T>` instead of just arrays?
export function filterByFrequency<T>(
  iterable: T[],
  frequency: number,
  comparator: PredefinedComparator<number> = strictEqualityComparator
): Entry<T>[] {
  const frequencies = new Map<T, number>()
  const indexes = new Map<T, number>()

  for (const [index, value] of iterable.entries()) {
    if (!frequencies.has(value))
      frequencies.set(value, 1)

    indexes.set(value, index)
  }

  return Array
    .from(frequencies)
    .filter(([, actualFrequency]) => comparator(actualFrequency, frequency))
    .map(([value]) => [value, indexes.get(value)!])
}

export function filterDistinct<T>(iterable: T[]): Entry<T>[] {
  return filterByFrequency(iterable, 1)
}

export function filterNonDistinct<T>(iterable: T[]): Entry<T>[] {
  return filterByFrequency(iterable, 1, greaterThanComparator)
}

export function containsOnlyUniqueElements<T>(iterable: T[]): boolean {
  const seen = new Set<T>()

  for (const value of iterable)
    if (seen.has(value))
      return false
    else
      seen.add(value)

  return true
}

export function binarySearchIterative<T>(iterable: T[], value: T): Maybe<number> {
  let low = 0
  let high = iterable.length - 1

  while (low !== high) {
    const middle = (low + high) / 2

    if (iterable[middle] === value)
      return Maybe.some(middle)
    else if (iterable[middle] < value)
      low = middle + 1
    else
      high = middle - 1
  }

  return Maybe.none()
}

export function makeArray<T>(size: number, callback: Callback<T>): T[] {
  const array = new Array<T>(size)

  for (let i = 0; i < size; i++)
    array[i] = callback()

  return array
}
