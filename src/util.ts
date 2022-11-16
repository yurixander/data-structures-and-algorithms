import { Either, Result } from "./either"

export namespace Util {
  export type Thunk<T = void> = () => T

  export type ThunkWithParam<T, U = void> = (_: T) => U

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

  export function tryDo<T>(thunk: Thunk<T>): Result<T> {
    try {
      return Either.left(thunk())
    }
    catch (error) {
      return Either.right(error as Error)
    }
  }

  export function overrideDelete(): never {
    throw new Error("This function has been deleted")
  }

  export function unimplemented(): never {
    throw new Error("Not yet implemented")
  }
}
