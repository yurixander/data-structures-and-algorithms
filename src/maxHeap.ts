import { Comparator } from "./algorithm"
import { MinHeap } from "./minHeap"
import { Util } from "./util"

export type MaxHeapInverter<T> = Util.ThunkWithParam<T, T>

export const numberInverter = (value: number): number => -value

export class MaxHeap<T> extends MinHeap<T> {
  constructor(
    public readonly inverter: MaxHeapInverter<T>,
    comparator: Comparator<T> = (a, b) => a === b
  ) {
    super([], comparator)
  }

  get(): T {
    return this.inverter(super.get())
  }

  insert(value: T): void {
    super.insert(this.inverter(value))
  }
}
