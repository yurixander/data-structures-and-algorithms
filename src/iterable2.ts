import { Util } from "./util"

export abstract class Iterable2<T> {
  abstract get values(): T[]

  constructor(public readonly iterable: Iterable<T>) {
    //
  }

  map(mapper: Util.ThunkWithParam<T, T>): Iterable2<T> {
    // TODO: Implement.
    Util.unimplemented()

    // return this.values.map(() => mapper)
  }
}
