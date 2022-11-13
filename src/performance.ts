import { Callback } from "./common"
import { Math2 } from "./math"
import { Util } from "./util"

export namespace Performance {
  /**
   * An array of 3 elements representing the best case (Big-Ω) time, average time (Big-θ),
   * and worst case (Big-O) time measurements of a runtime complexity performance test.
   */
  export type RuntimeComplexityTrio = [RuntimeComplexity, RuntimeComplexity, RuntimeComplexity]

  export type RuntimeComplexityMeasurementOptions = {
    approximateTimePerItem: number,
    errorMarginPercentage: number,
    sampleSize: number
  }

  const defaultRuntimeComplexityMeasurementOptions: RuntimeComplexityMeasurementOptions = {
    approximateTimePerItem: 1000,
    errorMarginPercentage: 10,
    sampleSize: 100
  }

  export enum RuntimeComplexity {
    /**
     * O(1).
     */
    Constant,

    /**
     * O(log(n)).
     */
    Logarithmic,

    /**
     * O(√n).
     */
    SquareRoot,

    /**
     * O(n).
     */
    Linear,

    /**
     * O(n^x).
     */
    Exponential,

    /**
     * O(n!).
     */
    Factorial,

    /**
     * O(∞).
     */
    Infinity
  }

  export function measure(thunk: Callback): number {
    let start = performance.now()

    thunk()

    return performance.now() - start
  }

  function isWithinErrorMargins(actual: number, expected: number, errorMarginPercentage: number): boolean {
    if (actual === expected)
      return true

    let errorMargin = expected * (errorMarginPercentage / 100)
    let min = expected - errorMargin
    let max = expected + errorMargin

    return actual >= min && actual <= max
  }

  export function runtimeComplexityOf(
    approximateTime: number,
    errorMarginPercentage: number,
    actualTime: number
  ): RuntimeComplexity {
    // FIXME: Hard-coded?
    let constantTime = 3

    if (actualTime <= constantTime)
      return RuntimeComplexity.Constant

    let linearTime = approximateTime
    let logarithmicTime: Util.Lazy<number> = () => Math.log(approximateTime)
    let squareRootTime: Util.Lazy<number> = () => Math.sqrt(approximateTime)
    let exponentialTime: Util.Lazy<number> = () => approximateTime ** 2
    let factorialTime: Util.Lazy<number> = () => Math2.factorialRecursive(approximateTime)

    if (isWithinErrorMargins(actualTime, linearTime, errorMarginPercentage))
      return RuntimeComplexity.Constant
    else if (isWithinErrorMargins(actualTime, logarithmicTime(), errorMarginPercentage))
      return RuntimeComplexity.Logarithmic
    else if (isWithinErrorMargins(actualTime, squareRootTime(), errorMarginPercentage))
      return RuntimeComplexity.SquareRoot
    else if (isWithinErrorMargins(actualTime, exponentialTime(), errorMarginPercentage))
      return RuntimeComplexity.Exponential
    else if (isWithinErrorMargins(actualTime, factorialTime(), errorMarginPercentage))
      return RuntimeComplexity.Factorial

    return RuntimeComplexity.Infinity
  }

  /**
   * Approximate the runtime complexity of a given operation.
   */
  export function measureRuntimeComplexity(
    thunk: Callback,
    n: number,
    partialOptions: Partial<RuntimeComplexityMeasurementOptions> = defaultRuntimeComplexityMeasurementOptions
  ): RuntimeComplexityTrio {
    let options = Util.assignOrOverrideOptions(partialOptions, defaultRuntimeComplexityMeasurementOptions)

    if (options.sampleSize < 1)
      throw new Error("Sample size must be 1 or greater")

    let fastestTime = Number.POSITIVE_INFINITY
    let slowestTime = Number.NEGATIVE_INFINITY
    let sampleTimeSum = 0
    let sampleTimeCount = 0

    Util.repeat(options.sampleSize, () => {
      let sampleMeasurement = measure(thunk)

      if (sampleMeasurement < fastestTime)
        fastestTime = sampleMeasurement

      if (sampleMeasurement > slowestTime)
        slowestTime = sampleMeasurement

      sampleTimeSum += sampleMeasurement
      sampleTimeCount++
    })

    // NOTE: Since the count is always guaranteed to be >1, there should never
    // be a division by zero edge case.
    let averageTime = sampleTimeSum / sampleTimeCount

    let approximateTime = n * options.approximateTimePerItem

    // TODO: Casting/qualifying. Any way to avoid that?
    return [fastestTime, averageTime, slowestTime].map(actualTime =>
      runtimeComplexityOf(approximateTime, options.errorMarginPercentage, actualTime)
    ) as RuntimeComplexityTrio
  }
}
