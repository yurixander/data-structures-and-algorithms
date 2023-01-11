import {Maybe} from "./monad/maybe.js"
import {Callback} from "./util.js"

/**
 * An incremental infinite list.
 */
export class Stream<T> {
  static fibonacci = (() => {
    const go = (f0: number, f1: number): Stream<number> =>
      new Stream(f0, Maybe.just(() => go(f1, f0 + f1)))

    return go(0, 1)
  })()

  static randomImperative = Stream.fromCallback(Math.random)

  // TODO: Cyclic stream.

  static from(number: number): Stream<number> {
    return new Stream(number, Maybe.just(() => Stream.from(number + 1)))
  }

  static fromCallback<T>(callback: Callback<T>): Stream<T> {
    return new Stream(callback(), Maybe.just(() => Stream.fromCallback(callback)))
  }

  static constant(number: number): Stream<number> {
    return Stream.fromCallback(() => number)
  }

  static signs(number: number): Stream<number> {
    return new Stream(number, Maybe.just(() => Stream.signs(-number)))
  }

  constructor(
    // TODO: First value must be lazy-evaluated, otherwise the first value will be evaluated when the stream is created. Alternatively, is there a way to specify when to use laziness?
    public readonly value: T,
    public readonly next: Maybe<Callback<Stream<T>>> = Maybe.nothing()
  ) {
    //
  }

  takeImperative(amount: number): T[] {
    let count = 0
    let bufferOpt: Maybe<Stream<T>> = Maybe.just(this)
    const result: T[] = []

    while (count !== amount && bufferOpt.isSome()) {
      const buffer = bufferOpt.do()

      result.push(buffer.value)
      bufferOpt = Maybe.just(buffer.next.do()())
      count++
    }

    return result
  }

  // BUG: Somehow, for the last stream node, it is `null`.
  take(amount: number): Stream<T> {
    const next = this.next.isSome() && amount > 1
      ? Maybe.just(() => this.next.do()().take(amount - 1))
      : Maybe.nothing<Callback<Stream<T>>>()

    return new Stream(this.value, next)
  }

  toArrayRecursive(): T[] {
    if (this.next.isSome())
      return [this.value, ...this.next.do()().toArrayRecursive()]

    return []
  }

  toArrayImperative(): T[] {
    const result = [this.value]
    let nodeOpt: Stream<T> = this

    while (nodeOpt.next.isSome()) {
      const node = nodeOpt.next.do()()

      result.push(node.value)
      nodeOpt = node
    }

    return result
  }
}
