import { Either } from "./either.js"
import { Matrix } from "./matrix.js"
import { Performance } from "./performance.js"
import { Stream } from "./stream.js"
import { Option } from "./option.js"

// TODO
// let dimensions = {
//   rows: 1_000,
//   columns: 1_000
// }

// let thunk = () => Matrix
//   .unit<number>(dimensions.rows, dimensions.columns)
//   .left()
//   .fill(Math.random())

// let runtimeComplexities = Performance.measureRuntimeComplexity(thunk, dimensions.rows * dimensions.columns)
//   .map(runtimeComplexity => Performance.RuntimeComplexity[runtimeComplexity] as string)

// console.log(runtimeComplexities)

console.log(Either.try(() => {
  const a: any = null

  a.something.far
}))

console.log(Either.left(1))

console.log("Here's the fib. list:", Stream.fibonacci.takeImperative(14))
console.log("\n\nHere's a few random numbers:", Stream.randomImperative.takeImperative(10))
