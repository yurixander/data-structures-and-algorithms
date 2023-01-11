import {Index} from "../int.js"
import {Maybe} from "../monad/maybe.js"
import {EndoFunctor, Foldable} from "../monad/monad.js"
import {CallbackWithParam, unimplemented} from "../util.js"

export interface ForwardIterable<T> {
  iter(): ForwardIterator<T>
}

export type IteratorPredicate<T> = (value: T) => T | undefined

export type Into<T, U> = (values: Iterable<T>) => U

export class ForwardIterator<T> implements Iterable<T>, EndoFunctor<T>, Foldable<T> {
  static lift<T>(iterable: Iterable<T>): ForwardIterator<T> {
    return new ForwardIterator(iterable)
  }

  readonly iterable: Iterable<T>
  private readonly predicate?: IteratorPredicate<T>

  protected constructor(iterable: Iterable<T>, predicate?: IteratorPredicate<T>) {
    this.iterable = iterable
    this.predicate = predicate
  }

  // REVISE: This suffers from possible stack overflow, although unlikely. This is because closures keep getting stacked on top of each other when the new instance is created.
  private joinPredicateWith(predicate: IteratorPredicate<T>): IteratorPredicate<T> {
    return value => {
      if (this.predicate)
        this.predicate(value)

      return predicate(value)
    }
  }

  private transformTo(predicate: IteratorPredicate<T>): ForwardIterator<T> {
    return new ForwardIterator(this.iterable, this.joinPredicateWith(predicate))
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

  /**
   * Collectss all values from the iterator into a set.
   *
   * This operation is not lazy and will consume the entire iterator.
   */
  intoSet(): Set<T> {
    return this.into(values => new Set(values))
  }

  /**
   * Collects all the values from the iterator, applying the given transformation
   * function to an array containing all the values, and then returning the result.
   *
   * This operation is not lazy and will consume the entire iterator.
   */
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

  /**
   * Returns the value at the given index, if any. If there is no value, or
   * the index is out of bounds, `Maybe.none()` is returned instead.
   *
   * This operation is not lazy and will consume the entire iterator.
   *
   * @param index The index of the value to return.
   * @returns The value at the given index, if any.
   * @example
   */
  nth(index: Index): Maybe<T> {
    let result: Maybe<T> = Maybe.nothing()
    let indexCounter = -1

    this.forEach(value => {
      indexCounter++

      if (indexCounter === index.value) {
        result = Maybe.just(value)

        return false
      }

      return true
    })

    return result
  }

  /**
   * Determine whether all the values match a given predicate.
   *
   * This operation is not lazy and will consume the entire iterator.
   *
   * @param predicate The predicate to match against.
   * @returns `true` if all the values match the predicate, `false` otherwise.
   * @example frequencies.forAll(frequency => frequency > 0) // All values are positive.
   */
  forAll(predicate: CallbackWithParam<T, boolean>): boolean {
    return !this.findOne(value => !predicate(value)).isSome()
  }

  /**
   * Determine whether there is at least one value that matches a given predicate.
   *
   * This operation is not lazy and will consume the entire iterator.
   *
   * @param predicate The predicate to match against.
   * @returns `true` if there is at least one value that matches the predicate,
   * `false` otherwise.
   * @example frequencies.thereExists(frequency => frequency === 1) // A unique value exists.
   */
  thereExists(predicate: CallbackWithParam<T, boolean>): boolean {
    return this.findOne(predicate).isSome()
  }

  /**
   * Fold the iterator using the given reducer. This will accumulate the values,
   * combining them into a single value. The direction of the fold is from left
   * to right.
   *
   * If the iterator is empty, `Maybe.none()` is returned.
   *
   * This operation is not lazy and will consume the entire iterator.
   *
   * @param reducer The reducer to use to combine the values.
   * @returns The accumulated value, if any.
   * @example values.fold((a, b) => a + b) // Sum all the values.
   */
  fold<U>(reducer: (accumulator: U, value: T) => U, initial: U): U {
    let accumulator = initial

    this.forEach(value => void (accumulator = reducer(accumulator, value)))

    return accumulator
  }

  /**
   * Filters the iterator using the given predicate.
   *
   * @param predicate The predicate to filter the values by.
   * @returns A new iterator with the filtered values.
   * @example values.filter(value => value >= 0) // Remove all negative values.
   */
  filter(predicate: CallbackWithParam<T, boolean>): ForwardIterator<T> {
    return this.transformTo(value => predicate(value) ? value : undefined)
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

  // TODO: Unzip.

  // TODO: Sort.

  take(amount: number): ForwardIterator<T> {
    // REVISE: This is wrong.
    return this.transformTo(value => {
      if (amount === 0)
        return undefined

      amount--

      return value
    })
  }

  takeWhile(predicate: CallbackWithParam<T, boolean>): ForwardIterator<T> {
    // TODO: Implement.
    unimplemented()
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

  skip(amount: number): ForwardIterator<T> {
    return this.transformTo(value => {
      // REVISE: Re-implement without for loop (since it uses mutation).
      for (let i = 0; i < amount; i++)
        if (this.next().done)
          return undefined

      // REVIEW: Is this correct? Return `value`? This was made up.
      return value
    })
  }

  // enumerate(): ForwardIterator<[number, T]> {
  //   return new ForwardIterator<[number, T]>(this.iterable, (value: T) =>
  //     [this.index, value]
  //   )
  // }

  transform<U>(predicate: CallbackWithParam<T, U>): ForwardIterator<U> {
    // REVISE: Not lazy.
    return new ForwardIterator<U>(this.intoArray().map(predicate))
  }

  map<U>(predicate: CallbackWithParam<T, U>): U[] {
    // REVISE: Not lazy.
    return this.intoArray().map(predicate)
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
