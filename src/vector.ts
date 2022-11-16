import { Util } from "./util"

export class Vector<T> {
  private capacity_: number

  constructor(public readonly values: T[]) {
    this.capacity_ = 0
  }

  get capacity(): number {
    return this.capacity_
  }

  get length(): number {
    return this.values.length
  }

  resize(capacity: number): void {
    this.values.length = capacity
    this.capacity_ = capacity
  }

  reserve(amount: number): void {
    this.resize(this.values.length + amount)
  }

  pushBack(...values: T[]) {
    this.values.push(...values)
  }

  pushFront(...values: T[]) {
    // TODO: Implement.
    Util.unimplemented()
  }

  zip(other: Vector<T>, callback: (a: T, b: T) => void): boolean {
    if (this.length !== other.length)
      return false

    for (let i = 0; i < this.length; i++)
      callback(this.values[i], other.values[i])

    return true
  }
}
