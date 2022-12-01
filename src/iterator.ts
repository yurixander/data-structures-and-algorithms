import {ThunkWithParam, unimplemented} from "./util"

export abstract class Iterator<T> {
  abstract get values(): T[]

  constructor(public readonly iterable: Iterable<T>) {
    //
  }

  map(mapper: ThunkWithParam<T, T>): Iterator<T> {
    // TODO: Implement.
    unimplemented()

    // return this.values.map(() => mapper)
  }
}
