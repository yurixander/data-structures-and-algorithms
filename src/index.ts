import { Matrix } from "./matrix"
import { Performance } from "./performance"
import { Util } from "./util"

// TODO
let dimensions = {
  rows: 1_000,
  columns: 1_000
}

let thunk = () => Matrix
  .unit(dimensions.rows, dimensions.columns)
  .left()
  .fill(Math.random())

let runtimeComplexities = Performance.measureRuntimeComplexity(thunk, dimensions.rows * dimensions.columns)
  .map(runtimeComplexity => Performance.RuntimeComplexity[runtimeComplexity] as string)

console.log(runtimeComplexities)

Util.tryDo(() => 1 / 0)
