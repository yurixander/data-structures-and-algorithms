import {Result} from "./monad/either.js"
import {Monad} from "./monad/monad.js"
import {unimplemented} from "./util.js"

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

  public transform<U>(f: (value: T) => U): Parser<U> {
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

  do(): T {
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

// const seqParser = Parser.sequence()

// Define a parser combinator that takes two parsers and returns a new parser
// that applies the first parser, followed by the second parser, and returns
// the result of the second parser.
// const seq = functi<A, B> (parser1: Parser<A>, parser2: Parser<B>
