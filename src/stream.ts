import { Option } from "./option"
import { Util } from "./util"

export class Stream<T> {
  static from(number: number): Stream<number> {
    return new Stream(number, Option.some(() => Stream.from(number + 1)))
  }

  static constant(number: number): Stream<number> {
    return new Stream(number, Option.some(() => Stream.constant(number)))
  }

  static fibonacci: Stream<number> = (() => {
    let go = (f0: number, f1: number): Stream<number> =>
      new Stream(f0, Option.some(() => go(f1, f0 + f1)))

    return go(0, 1)
  })()

  constructor(
    public readonly value: T,
    public readonly next: Option<Util.Thunk<Stream<T>>> = Option.none()
  ) {
    //
  }

  takeNaive(amount: number): T[] {
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
    let next = this.next.isSome() && amount > 1
      ? Option.some(() => this.next.unwrap()().take(amount - 1))
      : Option.none<Util.Thunk<Stream<T>>>()

    return new Stream(this.value, next)
  }

  toArrayRecursive(): T[] {
    if (this.next.isSome())
      return [this.value, ...this.next.unwrap()().toArrayRecursive()]

    return []
  }

  toArray(): T[] {
    let result = []
    let nodeOpt: Stream<T> = this

    while (nodeOpt.next.isSome()) {
      let node = nodeOpt.next.unwrap()()

      result.push(node.value)
      nodeOpt = node
    }

    return result
  }
}
