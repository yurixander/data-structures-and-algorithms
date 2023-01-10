import {Maybe} from "./maybe.js"
import {Monad} from "./monad.js"
import {createInterface} from "readline"
import {stdin, stdout} from "process"
import {Future} from "./future.js"

export class IO<T = void> implements Monad<T> {
  static lift<T>(effect: () => T): IO<T> {
    return new IO(effect)
  }

  private readonly effect: () => T

  private constructor(effect: () => T) {
    this.effect = effect
  }

  map<U>(f: (value: T) => U): IO<U> {
    return IO.lift(() => f(this.effect()))
  }

  bind<U>(f: (value: T) => Monad<U>): Monad<U> {
    return f(this.effect())
  }

  getOrDo(): T {
    return this.effect()
  }
}

export function printLn(text: string): IO {
  return IO.lift(() => console.log(text))
}

export function prompt(message?: string, fallback?: string): IO<Maybe<string>> {
  return IO.lift(() => Maybe.try(window.prompt(message, fallback)))
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
    () => printLn(text)

  printLn("hello world")
    .bind(curryPrintLn("hi"))
    .bind(curryPrintLn("foo"))
    .bind(curryPrintLn("how are you doing today?"))
    .bind(() => readLn("write your name:"))
    .getOrDo()
}
