import {Maybe} from "./monad/maybe.js"

export type Pair<T, U> = [first: T, second: U]

export type Callback<T = void> = () => T

export type CallbackWithParam<T, U = void> = (_: T) => U

export type IndexableObject = {[propertyName: string]: unknown}

export type Immutable<T> = {
  +readonly [Key in keyof T]: Immutable<T[Key]>
}

/**
 * A meta type representing a result of an operation may cause a
 * runtime error to be thrown.
 */
export type Unsafe<T = void> = T | never

// TODO: Create `Predicate` type: same as callbackWithParam, but returns boolean and input value is deep-readonly.

// export interface Ordered {
//   lessThan()
// }

export function validateIndex(index: number, length: number): boolean {
  return Number.isInteger(index)
    && index >= 0
    && index <= length - 1
}

export function forceValidateIndex(index: number, length: number): void | never {
  if (!validateIndex(index, length))
    throw new Error(`Index is invalid: ${index}; expected to be an integer, >=0 and <=${length - 1}`)
}

export function cyclicRangeClamp(current: number, offset: number, max: number, min = 0): number {
  return (current - min + (offset % max) + max) % max + min
}

export function assignOrOverrideOptions<T>(partialOptions: Partial<T>, defaults: T): T {
  if (partialOptions === defaults)
    return defaults

  return {...defaults, ...partialOptions}
}

export function repeat(times: number, callback: Callback): void {
  for (let i = 0; i < times; i++)
    callback()
}

export function overrideDelete(): never {
  throw new Error("This function has been deleted")
}

export function unimplemented(): never {
  throw new Error("Not yet implemented")
}

export function zip<A, B>(
  a: Iterable<A>,
  b: Iterable<B>
): Iterable<[Maybe<A>, Maybe<B>]> {
  const iteratorA = a[Symbol.iterator]()
  const iteratorB = b[Symbol.iterator]()

  return {
    [Symbol.iterator]: () => ({
      // TODO: Adapt to `Maybe`.
      next: () => {
        const nextA = iteratorA.next()
        const nextB = iteratorB.next()

        if (nextA.done || nextB.done)
          return {done: true, value: undefined}

        return {done: false, value: [nextA.value, nextB.value]}
      }
    })
  }
}

export function tryZip<A, B>(a: A[], b: B[]): Maybe<Iterable<[A, B]>> {
  if (a.length !== b.length)
    return Maybe.none()

  const result = new Array(Math.max(a.length, b.length))

  for (let i = 0; i < result.length; i++)
    result[i] = [a[i], b[i]]

  return Maybe.some(result)
}

// TODO: Fix error.
// export function tryExtractDeepProperty(unsafeObject: IndexableObject, propertyChain: string[]): Option<unknown> {
//   if (propertyChain.length === 0)
//     return Option.none()

//   let cursor = unsafeObject
//   let position = 0

//   while (position !== propertyChain.length) {
//     const next = cursor[propertyChain[position]]

//     if (next === undefined)
//       return Option.none()

//     cursor = next
//     position++
//   }

//   return Option.some(cursor)
// }

export function range(from: number, to: number): number[] {
  if (from > to)
    throw new Error("Range bounds are invalid")

  const length = to - from
  const result = new Array(length + 1)

  for (let i = 0; i <= length; i++)
    result[i] = from + i

  return result
}

export function map2<A, B, C>(a: A, b: B, callback: (a: A, b: B) => C): C {
  return callback(a, b)
}

export function compose(...functions: Function[]): Function {
  return (input: unknown) =>
    functions.reduceRight((acc, func) => func(acc), input)
}
