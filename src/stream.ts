import { Util } from "./util";

export class Stream<T> {
  constructor(public readonly generator: Util.ThunkWithParam<T, T>) {
    //
  }

  next(): T {
    // TODO: Implement.
    Util.unimplemented()
    // return this.generator(this)
  }

  take(amount: number): T[] {
    // TODO: Implement.
    Util.unimplemented()
  }
}
