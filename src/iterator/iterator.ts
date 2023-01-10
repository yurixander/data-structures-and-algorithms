import {Maybe} from "../monad/maybe.js"
import {CallbackWithParam, unimplemented} from "../util.js"

export interface ForwardIterable<T> {
  iter(): ForwardIterator<T>
}

export type IteratorPredicate<T> = (value: T) => T | undefined

export type Into<T, U> = (values: Iterable<T>) => U

export class ForwardIterator<T> implements Iterable<T> {
  readonly iterable: Iterable<T>
  private readonly predicate?: IteratorPredicate<T>

  constructor(iterable: Iterable<T>, predicate?: IteratorPredicate<T>) {
    this.iterable = iterable
    this.predicate = predicate
  }

  [Symbol.iterator](): Iterator<T> {
    return this.iterable[Symbol.iterator]()
  }

  next(): IteratorResult<T> {
    return this.iterable[Symbol.iterator]().next()
  }

  /**
   * Collects all values from the iterator into an array.
   *
   * This operation is not lazy and will consume the entire iterator.
   */
  intoArray(): T[] {
    return this.into(values => Array.from(values))
  }

  intoSet(): Set<T> {
    return this.into(values => new Set(values))
  }

  into<U>(into: Into<T, U>): U {
    const values: T[] = []

    this.forEach(value => void values.push(value))

    return into(values)
  }

  /**
   * Applies the given callback to each value in the iterator.
   *
   * This operation is not lazy and will consume the entire iterator.
   */
  forEach(callback: CallbackWithParam<T, boolean | void>): void {
    let done = false

    do {
      const next = this.iterable[Symbol.iterator]().next()

      // REVIEW: Why is `.done` property undefined? This may be an unsafe cast.
      done = next.done!

      const signal = callback(next.value)

      // REVIEW: Why is value not of type `T`?
      if (signal !== undefined && !signal)
        return
    }
    while (!done)
  }

  /**
   * Filters the iterator using the given predicate.
   */
  filter(predicate: CallbackWithParam<T, boolean>): ForwardIterator<T> {
    // REVIEW: Even though the predicate is a callback, it is not lazy? Since we're still iterating over the entire iterator?
    return new ForwardIterator(this.iterable, (value: T) => {
      return predicate(value) ? value : undefined
    })
  }

  /**
   * Finds the first value in the iterator that matches the given predicate.
   * Returns `Maybe.none()` if no value matches the predicate.
   *
   * This operation is not lazy and will consume the entire iterator.
   */
  findOne(predicate: CallbackWithParam<T, boolean>): Maybe<T> {
    let result: Maybe<T> = Maybe.nothing()

    this.forEach(value => {
      if (predicate(value)) {
        result = Maybe.just(value)

        return false
      }

      return true
    })

    return result
  }

  nth(n: number): Maybe<T> {
    let result: Maybe<T> = Maybe.nothing()
    let index = -1

    this.forEach(value => {
      index++

      if (index === n) {
        result = Maybe.just(value)

        return false
      }

      return true
    })

    return result
  }

  forAll(predicate: CallbackWithParam<T, boolean>): boolean {
    return !this.findOne(value => !predicate(value)).isSome()
  }

  thereExists(predicate: CallbackWithParam<T, boolean>): boolean {
    return this.findOne(predicate).isSome()
  }

  zip<U>(other: ForwardIterator<U>): ForwardIterator<[T, U]> {
    // TODO: Fix error.
    unimplemented()
    // return new ForwardIterator<[T, U]>(zip(this.iterable, other), (value: T) => {
    //   const otherValue = other.next().value

    //   if (otherValue === undefined)
    //     return undefined

    //   return [value, otherValue]
    // })
  }

  take(amount: number): ForwardIterator<T> {
    // REVISE: This is wrong.
    return new ForwardIterator<T>(this.iterable, (value: T) => {
      if (amount === 0)
        return undefined

      amount--

      return value
    })
  }

  chain(other: ForwardIterator<T>): ForwardIterator<T> {
    // TODO: Implement.
    unimplemented()
  }

  chainOne(value: T): ForwardIterator<T> {
    // TODO: Implement.
    unimplemented()
  }

  count(): number {
    let count = 0

    this.forEach(() => {
      count++

      return true
    })

    return count
  }

  skip(amount: number): void {
    // TODO: Implement.
    unimplemented()
  }

  // enumerate(): ForwardIterator<[number, T]> {
  //   return new ForwardIterator<[number, T]>(this.iterable, (value: T) =>
  //     [this.index, value]
  //   )
  // }

  map<U>(predicate: CallbackWithParam<T, U>): ForwardIterator<U> {
    // REVISE: Not lazy.
    return new ForwardIterator<U>(this.intoArray().map(predicate))
  }
}

export class BidirectionalIterator<T> extends ForwardIterator<T> {
  constructor(iterable: Iterable<T>) {
    super(iterable)
  }

  override next(): IteratorResult<T> {
    return super.next()
  }

  previous(): IteratorResult<T> {
    unimplemented()
  }
}
