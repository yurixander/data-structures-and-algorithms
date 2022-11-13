import { Callback } from "./common"
import { Either, Result } from "./either"

export namespace Util {
  export type Lazy<T> = Callback<T>

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

  export function repeat(times: number, thunk: Callback): void {
    for (let i = 0; i < times; i++)
      thunk()
  }

  export function tryDo<T>(thunk: Callback<T>): Result<T> {
    try {
      return Either.left(thunk())
    }
    catch (error) {
      return Either.right(error as Error)
    }
  }
}
