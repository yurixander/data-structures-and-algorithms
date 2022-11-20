import { Util } from "./util"

export namespace Hashing {
  export function divisionMethod(k: number, m: number): number {
    return k % m
  }

  export function multiplicationMethod(k: number, m: number): number {
    const A = Math.random()
    const aTimesK = A * k

    // TODO: Ensure number is always a fraction.
    let aTimesKFractionPart = aTimesK.toString().split(".")[1]

    return parseInt(aTimesKFractionPart) * m
  }

  export function midSquareMethod(k: number, r: number): number {
    const kSquared = k ** 2

    // TODO: Continue implementation.
    Util.unimplemented()
  }
}
