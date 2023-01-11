import {Maybe} from "./maybe.js"
import {Monad} from "./monad.js"
import {createInterface} from "readline"
import {stdin, stdout} from "process"
import {Future} from "./future.js"

export class IO<T = void> implements Monad<T> {
  static lift<T>(effect: () => T): IO<T> {
    return new IO(effect)
  }

  static sequence(...ios: IO[]): IO {
    return ios.reduce(
      (acc, io) => acc.bind(() => io),
      IO.lift(() => undefined)
    )
  }

  private readonly effect: () => T

  private constructor(effect: () => T) {
    this.effect = effect
  }

  transform<U>(f: (value: T) => U): IO<U> {
    return IO.lift(() => f(this.effect()))
  }

  bind<U>(f: (value: T) => IO<U>): IO<U> {
    return f(this.effect())
  }

  do(): T {
    return this.effect()
  }
}

log("hi").do()

export function log(...messages: string[]): IO {
  return IO.lift(() => console.log(...messages))
}

export function prompt(message?: string, fallback?: string): IO<Maybe<string>> {
  return IO.lift(() => Maybe.from(window.prompt(message, fallback)))
}

// REVIEW: Shouldn't it be `Future<IO<string>>`?
export function readLn(query: string): IO<Future<string>> {
  return IO.lift(() =>
    Future.lift(resolve =>
      createInterface(stdin, stdout)
        .question(query, answer => resolve(answer))
    )
  )
}

function main() {
  const curryPrintLn = (text: string) =>
    () => log(text)

  log("hello world")
    .bind(curryPrintLn("hi"))
    .bind(curryPrintLn("foo"))
    .bind(curryPrintLn("how are you doing today?"))
    .bind(() => readLn("write your name:"))
    .do()
}
