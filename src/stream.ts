import {Maybe} from "./monad/maybe.js"
import {Callback} from "./util.js"

export class Stream<T> {
  static fibonacci = (() => {
    const go = (f0: number, f1: number): Stream<number> =>
      new Stream(f0, Maybe.some(() => go(f1, f0 + f1)))

    return go(0, 1)
  })()

  static randomImperative = Stream.fromCallback(Math.random)

  // TODO: Cyclic stream.

  static from(number: number): Stream<number> {
    return new Stream(number, Maybe.some(() => Stream.from(number + 1)))
  }

  static fromCallback<T>(callback: Callback<T>): Stream<T> {
    return new Stream(callback(), Maybe.some(() => Stream.fromCallback(callback)))
  }

  static constant(number: number): Stream<number> {
    return Stream.fromCallback(() => number)
  }

  static signs(number: number): Stream<number> {
    return new Stream(number, Maybe.some(() => Stream.signs(-number)))
  }

  constructor(
    // TODO: First value must be lazy-evaluated, otherwise the first value will be evaluated when the stream is created. Alternatively, is there a way to specify when to use laziness?
    public readonly value: T,
    public readonly next: Maybe<Callback<Stream<T>>> = Maybe.none()
  ) {
    //
  }

  takeImperative(amount: number): T[] {
    let count = 0
    let bufferOpt: Maybe<Stream<T>> = Maybe.some(this)
    const result: T[] = []

    while (count !== amount && bufferOpt.isSome()) {
      const buffer = bufferOpt.getOrDo()

      result.push(buffer.value)
      bufferOpt = Maybe.some(buffer.next.getOrDo()())
      count++
    }

    return result
  }

  // BUG: Somehow, for the last stream node, it is `null`.
  take(amount: number): Stream<T> {
    const next = this.next.isSome() && amount > 1
      ? Maybe.some(() => this.next.getOrDo()().take(amount - 1))
      : Maybe.none<Callback<Stream<T>>>()

    return new Stream(this.value, next)
  }

  toArrayRecursive(): T[] {
    if (this.next.isSome())
      return [this.value, ...this.next.getOrDo()().toArrayRecursive()]

    return []
  }

  toArrayImperative(): T[] {
    const result = [this.value]
    let nodeOpt: Stream<T> = this

    while (nodeOpt.next.isSome()) {
      const node = nodeOpt.next.getOrDo()()

      result.push(node.value)
      nodeOpt = node
    }

    return result
  }
}
