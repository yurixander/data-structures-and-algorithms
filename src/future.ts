import { Callback } from "./common"

export enum FutureState {
  Unexecuted,
  Pending,
  Completed,
  Failed
}

export class Future<T> {
  static unit<T>(thunk: Callback<T>): Future<T> {
    return new Future(thunk)
  }

  private state_: FutureState

  constructor(public thunk: Callback<T>) {
    this.state_ = FutureState.Unexecuted
  }

  executeSync(): T {
    return this.thunk()
  }

  execute(): this {
    (async () => {
      this.state_ = FutureState.Pending

      try {
        await this.thunk()
      }
      catch {

      }

      this.state_ = FutureState.Completed
    })()

    return this
  }

  // then()
}
