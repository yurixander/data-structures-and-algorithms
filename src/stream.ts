import { Option } from "./option.js"
import { Util } from "./util.js"

export class Stream<T> {
  static fibonacci = (() => {
    const go = (f0: number, f1: number): Stream<number> =>
      new Stream(f0, Option.some(() => go(f1, f0 + f1)))

    return go(0, 1)
  })()

  static randomImperative = Stream.fromThunk(Math.random)

  // TODO: Cyclic stream.

  static from(number: number): Stream<number> {
    return new Stream(number, Option.some(() => Stream.from(number + 1)))
  }

  static fromThunk<T>(thunk: Util.Thunk<T>): Stream<T> {
    return new Stream(thunk(), Option.some(() => Stream.fromThunk(thunk)))
  }

  static constant(number: number): Stream<number> {
    return Stream.fromThunk(() => number)
  }

  static signs(number: number): Stream<number> {
    return new Stream(number, Option.some(() => Stream.signs(-number)))
  }

  constructor(
    // TODO: First value must be lazy-evaluated, otherwise the first value will be evaluated when the stream is created. Alternatively, is there a way to specify when to use laziness?
    public readonly value: T,
    public readonly next: Option<Util.Thunk<Stream<T>>> = Option.none()
  ) {
    //
  }

  takeImperative(amount: number): T[] {
    let count = 0
    let bufferOpt: Option<Stream<T>> = Option.some(this)
    let result: T[] = []

    while (count !== amount && bufferOpt.isSome()) {
      let buffer = bufferOpt.unwrap()

      result.push(buffer.value)
      bufferOpt = Option.some(buffer.next.unwrap()())
      count++
    }

    return result
  }

  // BUG: Somehow, for the last stream node, it is `null`.
  take(amount: number): Stream<T> {
    const next = this.next.isSome() && amount > 1
      ? Option.some(() => this.next.unwrap()().take(amount - 1))
      : Option.none<Util.Thunk<Stream<T>>>()

    return new Stream(this.value, next)
  }

  toArrayRecursive(): T[] {
    if (this.next.isSome())
      return [this.value, ...this.next.unwrap()().toArrayRecursive()]

    return []
  }

  toArrayImperative(): T[] {
    let result = [this.value]
    let nodeOpt: Stream<T> = this

    while (nodeOpt.next.isSome()) {
      let node = nodeOpt.next.unwrap()()

      result.push(node.value)
      nodeOpt = node
    }

    return result
  }
}
