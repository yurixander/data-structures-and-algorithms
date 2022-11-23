import { Option } from "./option.js"

export namespace Util {
  export type Thunk<T = void> = () => T

  export type ThunkWithParam<T, U = void> = (_: T) => U

  // TODO: Create `Predicate` type: same as ThunkWithParam, but returns boolean and input value is deep-readonly.

  // export interface Ordered {
  //   lessThan()
  // }

  export function validateIndex(index: number, length: number): boolean {
    return Number.isInteger(index)
      && index >= 0
      && index <= length - 1
  }

  export function forceValidateIndex(index: number, length: number): void | never {
    if (!Util.validateIndex(index, length))
      throw new Error(`Index is invalid: ${index}; expected to be an integer, >=0 and <=${length - 1}`)
  }

  export function cyclicRangeClamp(current: number, offset: number, max: number, min: number = 0): number {
    return (current - min + (offset % max) + max) % max + min
  }

  export function assignOrOverrideOptions<T>(partialOptions: Partial<T>, defaults: T): T {
    if (partialOptions === defaults)
      return defaults

    return { ...defaults, ...partialOptions }
  }

  export function repeat(times: number, thunk: Thunk): void {
    for (let i = 0; i < times; i++)
      thunk()
  }

  export function overrideDelete(): never {
    throw new Error("This function has been deleted")
  }

  export function unimplemented(): never {
    throw new Error("Not yet implemented")
  }

  export function zip<A, B>(a: A[], b: B[]): Iterable<[Option<A>, Option<B>]> {
    let result = new Array(Math.max(a.length, b.length))

    for (let i = 0; i < result.length; i++)
      result[i] = [Option.try(a.at(i)), Option.try(b.at(i))]

    return result
  }

  export function tryZip<A, B>(a: A[], b: B[]): Option<Iterable<[A, B]>> {
    if (a.length !== b.length)
      return Option.none()

    let result = new Array(Math.max(a.length, b.length))

    for (let i = 0; i < result.length; i++)
      result[i] = [a[i], b[i]]

    return Option.some(result)
  }

  export function tryExtractDeepProperty(unsafeObject: any, propertyChain: string[]): Option<unknown> {
    if (propertyChain.length === 0)
      return unsafeObject

    let cursor = unsafeObject
    let position = 0

    while (position !== propertyChain.length) {
      const next = cursor[propertyChain[position]]

      if (next === undefined)
        return Option.none()

      cursor = next
      position++
    }

    return Option.some(cursor)
  }

  export function range(from: number, to: number): number[] {
    if (from > to)
      throw new Error("Range bounds are invalid")

    const length = to - from
    let result = new Array(length + 1)

    for (let i = 0; i <= length; i++)
      result[i] = from + i

    return result
  }
}
