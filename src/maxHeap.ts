import { Comparator } from "./algorithm.js"
import { MinHeap } from "./minHeap.js"
import { Util } from "./util.js"

export type MaxHeapInverter<T> = Util.ThunkWithParam<T, T>

export const numberInverter = (value: number): number => -value

export class MaxHeap<T> extends MinHeap<T> {
  constructor(
    public readonly inverter: MaxHeapInverter<T>,
    comparator: Comparator<T> = (a, b) => a === b
  ) {
    super([], comparator)
  }

  override get(): T {
    return this.inverter(super.get())
  }

  override insert(value: T): void {
    super.insert(this.inverter(value))
  }
}
