import { Util } from "./util.js"

export abstract class Iterator<T> {
  abstract get values(): T[]

  constructor(public readonly iterable: Iterable<T>) {
    //
  }

  map(mapper: Util.ThunkWithParam<T, T>): Iterator<T> {
    // TODO: Implement.
    Util.unimplemented()

    // return this.values.map(() => mapper)
  }
}
