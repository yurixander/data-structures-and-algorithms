import { MaxHeap } from "./maxHeap.js"
import { Option } from "./option.js"

type PriorityQueueHeapValue<T> = [T, number]

export class PriorityQueue<TValue> {
  private maxHeap: MaxHeap<PriorityQueueHeapValue<TValue>>

  constructor() {
    // TODO: Fix comparator.
    this.maxHeap = new MaxHeap(value => [value[0], -value[1]], (a, b) => a[1] === b[1])

    // TODO: Finish implementing.
    throw new Error("Not yet implemented")
  }

  enqueue(value: TValue, priority: number) {
    this.maxHeap.insert([value, priority])
  }

  dequeue(): Option<TValue> {
    return Option.some(this.maxHeap.get()[0])

    // TODO: Perform sift operation.
  }
}
