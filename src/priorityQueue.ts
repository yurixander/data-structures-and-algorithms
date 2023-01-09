import {Heap} from "./tree/heap.js"
import {Maybe} from "./monad/maybe.js"
import {unimplemented} from "./util.js"

type PriorityQueueHeapValue<T> = [T, number]

export class PriorityQueue<TValue> {
  private maxHeap: Heap<PriorityQueueHeapValue<TValue>>

  constructor() {
    // TODO: Fix comparator.
    // this.maxHeap = new Heap(value => [value[0], -value[1]], (a, b) => a[1] === b[1])

    // TODO: Finish implementing.
    throw new Error("Not yet implemented")
  }

  enqueue(value: TValue, priority: number) {
    this.maxHeap.add([value, priority])
  }

  dequeue(): Maybe<TValue> {
    // return Option.some(this.maxHeap.poll()[0])

    // TODO: Finish implementation.
    unimplemented()
  }
}
