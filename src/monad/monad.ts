import {Either} from "./either.js"
import {unimplemented} from "../util.js"

export interface Monad<T> {
  /**
   * Transform the contained value (if any) by applying a given function.
   * A new instance of the monad will be returned, containing the (possibly)
   * transformed value.
   */
  map<U>(f: (value: T) => U): Monad<U>

  /**
   * Chains this monad with another, creating an abstract
   * sequence.
   */
  bind<U>(f: (value: T) => Monad<U>): Monad<U>

  /**
   * Get or execute the value or action abstracted by this monad.
   */
  getOrDo(): T
}

type Result<T> = Either<T, Error>

export type ParseFn<T> = (input: string) => Result<[T, string]>

// class Parser2<T> implements Monad<T> {
//   static lift<T>(parse: ParseFn<T>): Parser<T> {
//     return new Parser(parse)
//   }

//   private parse: ParseFn<T>

//   private constructor(parse: ParseFn<T>) {
//     this.parse = parse
//   }

//   public map<U>(f: (value: T) => U): Parser<U> {
//     return new Parser(input => {
//       const result = this.parse(input)

//       if (!result)
//         return null

//       return [f(result[0]), result[1]]
//     })
//   }

//   map2<U>(f: (value: T) => U): Parser<U> {
//     return Parser.lift(input =>
//       this.parse(input).mapLeft(result => [f(result[0]), result[1]])
//     ) as any
//   }

//   public bind<U>(f: (value: T) => Parser<U>): Parser<U> {
//     return new Parser((input) => {
//       const result = this.parse(input)

//       if (!result)
//         return null

//       return f(result[0]).parse(result[1])
//     })
//   }

//   bind2<U>(f: (value: T) => Parser<U>): Parser<U> {
//     return Parser.lift(input => {
//       const result = this.parse(input)

//       if (result === null)
//         return null

//       return f(result[0]).parse(result[1])
//     })
//   }

//   get(): ParseFn<T> {
//     return this.parse
//   }
// }

export class Parser<T> implements Monad<T> {
  // static sequence(...parsers: Parser<unknown>[]): Parser<unknown> {
  //   return parsers.reduce((acc, parser) => acc.bind((values) => parser.map((value) => [...values, value])), Parser.lift([]))
  // }

  static sequence2<A, B>(a: Parser<A>, b: Parser<B>): Monad<[A, B]> {
    // TODO: Implement.
    unimplemented()
  }

  readonly parse: (input: string) => [T, string] | null

  constructor(parse: (input: string) => [T, string] | null) {
    this.parse = parse
  }

  public map<U>(f: (value: T) => U): Parser<U> {
    return new Parser((input) => {
      const result = this.parse(input)
      if (!result) {
        return null
      }
      return [f(result[0]), result[1]]
    })
  }

  public bind<U>(f: (value: T) => Parser<U>): Parser<U> {
    return new Parser((input) => {
      const result = this.parse(input)
      if (!result) {
        return null
      }
      return f(result[0]).parse(result[1])
    })
  }

  getOrDo(): T {
    unimplemented()
  }
}

const stringParser = new Parser(input => [1, input])

const numberParser = new Parser(input => ["hello", input])

function sequence<T>(parsers: Parser<T>[]): Parser<T[]> {
  return new Parser(input => {
    // Create an empty array to store the results
    const results: T[] = []

    // Loop through each of the parsers and apply it to the input
    let remainingInput = input

    for (const parser of parsers) {
      // Apply the parser and get the result and the remaining input
      const result = parser.parse(remainingInput)

      if (result === null)
        return null

      // Add the result to the array and update the remaining input
      results.push(result[0])
      remainingInput = result[1]
    }

    // Return the array of results and the remaining input
    return [results, remainingInput]
  })
}

// const seqParser = Parser.sequence()

// Define a parser combinator that takes two parsers and returns a new parser
// that applies the first parser, followed by the second parser, and returns
// the result of the second parser.
// const seq = functi<A, B> (parser1: Parser<A>, parser2: Parser<B>

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

  map<U>(f: (value: T) => U): State<S, U> {
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

  getOrDo(): T {
    return this.value
  }

  put(value: S): State<S, T> {
    return State.lift(() => [value, this.value])
  }

  run(initialState: S): [S, T] {
    return this.f(initialState)
  }
}
