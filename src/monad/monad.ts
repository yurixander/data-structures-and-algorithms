import {Unsafe} from "../util.js"

export interface Foldable<T> {
  fold<U>(reducer: (accumulator: U, value: T) => U, initial: U): U
}

/**
 * A monoid is structure with a binary operation that is associative and has an
 * identity element.
 *
 * @example
 * const sumMonoid = new Monoid<number>({
 *   identity: 0,
 *   concat: (a, b) => a + b
 * })
 *
 * @example
 * const stringMonoid = new Monoid<string>({
 *   identity: "",
 *   concat: (a, b) => a + b
 * })
 *
 * @example
 * const arrayMonoid = new Monoid<unknown[]>({
 *   identity: [],
 *   concat: (a, b) => a.concat(b)
 * })
 */
export interface Monoid<T> {
  /**
   * The identity element of the binary operation, which when combined with any
   * other value of the set, it should return the other value itself.
   */
  readonly identity: T

  /**
   * Defines the binary operation of the monoid, which must be associative,
   * meaning that the order in which the operation is applied doesn't affect
   * the result.
   */
  concat(a: T, b: T): T
}

// REVIEW: This might help cleanup some logic when accepting transformers (for example an abstract mapper, we can specify that it extends `Functor<T>`, then we can call `.transform(f)` on it).

export interface EndoFunctor<T> {
  /**
   * Transform the contained value (if any) by applying a given function.
   * A new instance of the functor will be returned, containing the (possibly)
   * transformed value.
   *
   * @param f The function to apply to the contained value (if any).
   * @returns A new instance of the functor, containing the (possibly)
   * transformed value.
   * @example Maybe.just(1).transform(x => x + 1) // Maybe.just(2)
   */
  transform(f: (value: T) => T): EndoFunctor<T>
}

/**
 * Represents a value or container that if present, may be transformed into
 * a different state.
 */
export interface Functor<T> extends EndoFunctor<T> {
  transform<U>(f: (value: T) => U): Functor<U>
}

/**
 * A monad is a container that abstracts a value or action.
 *
 * It is a *functor*, which means it can be mapped over, and it is a monoid,
 * which means it can be combined with other monads.
 *
 * This is useful for abstracting values or actions that may or may not be
 * present, or that may fail.
 *
 * @param T The type of the value or action abstracted by this monad.
 */
export interface Monad<T> extends Functor<T> {
  /**
   * Chain the monad with another, creating an abstract sequence.
   *
   * The callback function `f` is invoked with the value contained by this
   * monad. The return value of `f` is then flattened (combined into a single
   * monad) and used to create a new resulting monad.
   *
   * This is equivalent to `flatMap`, `>==`, `then`, or `andThen` in other
   * languages.
   *
   * @param f A function that takes the value contained by this monad and
   * returns a monad.
   * @returns A new monad containing the value of the monad returned by
   * `f`.
   * @example Maybe.just(1).bind(x => Maybe.just(x + 1)) // Maybe.just(2)
   */
  bind<U>(f: (value: T) => Monad<U>): Monad<U>

  /**
   * Get or execute the value or action abstracted by this monad.
   *
   * ## Warning
   *
   * This operation is generally unsafe and may evaluate side-effects
   * encapsulated by the monad. Therefore, it should be abstracted away
   * and preferably invoked in a centralized location. The benefit of
   * this is that such location may then be tracked back to if problems
   * occur.
   *
   * A general rule of thumb is to only invoke this method in the main
   * function of a program.
   *
   * @example IO.lift(() => console.log("Hello, world!")).do()
   */
  do?(): Unsafe<T>
}

export class State<S, T> implements Monad<T> {
  static lift<S, T>(f: (state: S) => [S, T]): State<S, T> {
    return new State(f)
  }

  private readonly f: (state: S) => [S, T]
  private value: T

  private constructor(f: (state: S) => [S, T]) {
    this.f = f

    // TODO: Temporary.
    this.value = undefined as T
  }

  transform<U>(f: (value: T) => U): State<S, U> {
    return State.lift<S, U>(state => {
      const [nextState, result] = this.f(state)

      return [nextState, f(result)]
    })
  }

  bind<U>(f: (value: T) => State<S, U>): State<S, U> {
    return State.lift<S, U>(state => {
      const [nextState, result] = this.f(state)

      return f(result).run(nextState)
    })
  }

  do(): T {
    return this.value
  }

  put(value: S): State<S, T> {
    return State.lift(() => [value, this.value])
  }

  run(initialState: S): [S, T] {
    return this.f(initialState)
  }
}

export class Arrow<T, U> {
  public readonly run: (value: T) => U

  constructor(runner: (value: T) => U) {
    this.run = runner
  }

  map(f: (value: T) => U): Arrow<T, U> {
    return new Arrow(value => f(value))
  }

  compose<X>(other: Arrow<U, X>): Arrow<T, X> {
    return new Arrow(value => other.run(this.run(value)))
  }
}

export function id<T>(value: T): T {
  return value
}
