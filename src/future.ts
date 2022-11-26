import { Thunk } from "./util"

export enum FutureState {
  Unexecuted,
  Pending,
  Completed,
  Failed
}

export class Future<T> {
  static unit<T>(thunk: Thunk<T>): Future<T> {
    return new Future(thunk)
  }

  private state_: FutureState

  constructor(public thunk: Thunk<T>) {
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
        // TODO: Continue implementation.
      }

      this.state_ = FutureState.Completed
    })()

    return this
  }

  // then()
}
