export namespace Util {
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
}
