import {Maybe} from "../monad/maybe"
import {CallbackWithParam, unimplemented} from "../util"

export interface ForwardIterable<T> {
  iter(): ForwardIterator<T>
}

export type IteratorPredicate<T> = (value: T) => T | undefined

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
  toArray(): T[] {
    const result: T[] = []

    this.forEach(value => {
      result.push(value)

      return true
    })

    return result
  }

  /**
   * Applies the given callback to each value in the iterator.
   *
   * This operation is not lazy and will consume the entire iterator.
   */
  forEach(callback: CallbackWithParam<T, boolean>): void {
    let done = false

    do {
      const next = this.iterable[Symbol.iterator]().next()

      // REVIEW: Why is `.done` property undefined? This may be an unsafe cast.
      done = next.done!

      // REVIEW: Why is value not of type `T`?
      if (!callback(next.value))
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
    let result: Maybe<T> = Maybe.none()

    this.forEach(value => {
      if (predicate(value)) {
        result = Maybe.some(value)

        return false
      }

      return true
    })

    return result
  }

  nth(n: number): Maybe<T> {
    let result: Maybe<T> = Maybe.none()
    let index = -1

    this.forEach(value => {
      index++

      if (index === n) {
        result = Maybe.some(value)

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
    return new ForwardIterator<[T, U]>(zip(this.iterable, other), (value: T) => {
      const otherValue = other.next().value

      if (otherValue === undefined)
        return undefined

      return [value, otherValue]
    })
  }

  // enumerate(): ForwardIterator<[number, T]> {
  //   return new ForwardIterator<[number, T]>(this.iterable, (value: T) =>
  //     [this.index, value]
  //   )
  // }

  // FIXME: Type errors.
  map<U>(predicate: CallbackWithParam<T, U>): ForwardIterator<U> {
    return new ForwardIterator<U>(this.iterable, (value: T) => predicate(value))
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
