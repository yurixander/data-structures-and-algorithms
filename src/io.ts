import {Maybe} from "./maybe"
import {Monad} from "./monad"
import {createInterface} from "readline"
import {stdin, stdout} from "process"
import {Future} from "./future"

export class IO<T = void> implements Monad<T> {
  static lift<T>(effect: () => T): IO<T> {
    return new IO(effect)
  }

  private readonly effect: () => T

  private constructor(effect: () => T) {
    this.effect = effect
  }

  map<U>(f: (value: T) => U): Monad<U> {
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

export function prompt(message?: string, default_?: string): IO<Maybe<string>> {
  return IO.lift(() => Maybe.try(window.prompt(message, default_)))
}

// REVIEW: Shouldn't it be `Future<IO<string>>`?
export function readLn(query: string): IO<Future<string>> {
  return IO.lift(() =>
    Future.lift(resolve =>
      createInterface(stdin, stdout).question(query, answer => resolve(answer))
    )
  )
}

function main() {
  const curryPrintLn = (txt: string) =>
    () => printLn(txt)

  printLn("hello world")
    .bind(curryPrintLn("hi"))
    .bind(curryPrintLn("foo"))
    .bind(curryPrintLn("how are you doing today?"))
    .bind(() => readLn("write your name:"))
    .getOrDo()
}