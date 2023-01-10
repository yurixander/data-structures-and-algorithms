import {unimplemented} from "../util.js"
import {IO, printLn} from "./io.js"
import {Monad} from "./monad.js"

export class State<S, A> implements Monad<A> {
  static lift<S, A>(value: A): State<S, A> {
    return new State(state => [value, state])
  }

  static get<S>(): State<S, S> {
    return new State(state => [state, state])
  }

  static set<S>(state: S): State<S, void> {
    return new State(_ => [undefined, state])
  }

  readonly run: (state: S) => [A, S]

  constructor(runner: (state: S) => [A, S]) {
    this.run = runner
  }

  map<B>(f: (value: A) => B): State<S, B> {
    return new State(state => {
      const [value, s1] = this.run(state)

      return [f(value), s1]
    })
  }

  bind<B>(f: (value: A) => State<S, B>): State<S, B> {
    return new State(state => {
      const [value, s1] = this.run(state)

      return f(value).run(s1)
    })
  }

  getOrDo(): A {
    // TODO: Fix error.
    unimplemented()
    // return this.runState(undefined)[0]
  }
}

function usageExample(): IO {
  const incrementState = () =>
    State.get<number>().map(x => x + 1).bind(State.set)

  const result = incrementState()
    .bind(incrementState)
    .bind(incrementState)
    .run(0)

  return printLn(result.toString())
}
