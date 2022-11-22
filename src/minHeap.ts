import { Comparator } from "./algorithm.js"

export class MinHeap<T> {
  constructor(
    public values: T[],
    public readonly comparator: Comparator<T>
  ) {
    //
  }

  get(): T {
    // TODO: Implement.
    throw new Error("Not yet implemented")
  }

  insert(value: T): void {
    // TODO: Implement.
  }
}
