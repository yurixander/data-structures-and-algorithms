import {Monad} from "./monad.js"
import {unimplemented} from "../util.js"

export enum FutureState {
  Unexecuted,
  Pending,
  Completed,
  Failed
}

type FutureCallback<T> =
  (resolve: (value: T) => void, reject: (error: Error) => void) => void

export class Future<T> implements Monad<T> {
  static lift<T>(callback: FutureCallback<T>): Future<T> {
    return new Future(callback)
  }

  private callback: FutureCallback<T>

  private constructor(callback: FutureCallback<T>) {
    this.callback = callback
  }

  map<U>(f: (value: T) => U): Future<U> {
    return Future.lift((resolve, reject) =>
      this.callback(value => resolve(f(value)), reject))
  }

  bind<U>(f: (value: T) => Future<U>): Future<U> {
    return Future.lift((resolve, reject) =>
      this.callback(value => f(value).then(resolve, reject), reject))
  }

  catch(f: (error: Error) => Future<T>): Future<T> {
    return Future.lift((resolve, reject) =>
      this.callback(resolve, error => f(error).then(resolve, reject)))
  }

  then(onFulfilled: (value: T) => void, onRejected: (error: Error) => void): void {
    this.callback(onFulfilled, onRejected)
  }

  getOrDo(): T {
    unimplemented()
  }
}
