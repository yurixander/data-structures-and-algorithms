import {Comparator} from "./algorithm.js"
import {Option} from "./option.js"

export class Heap<T> {
  static getParentIndex(childIndex: number): number {
    return (childIndex - 1) / 2
  }

  static getLeftChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 1
  }

  static getRightChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 2
  }

  constructor(
    public readonly nodes: T[],
    public readonly comparator: Comparator<T>
  ) {
    //
  }

  private getParent(childIndex: number): Option<T> {
    return Option.try(this.nodes[Heap.getParentIndex(childIndex)])
  }

  private getLeftChild(parentIndex: number): Option<T> {
    return Option.try(this.nodes[Heap.getLeftChildIndex(parentIndex)])
  }

  private getRightChild(parentIndex: number): Option<T> {
    return Option.try(this.nodes[Heap.getRightChildIndex(parentIndex)])
  }

  private hasParent(childIndex: number): boolean {
    return this.nodes.at(Heap.getParentIndex(childIndex)) !== undefined
  }

  private hasLeftChild(parentIndex: number): boolean {
    return this.nodes.at(Heap.getLeftChildIndex(parentIndex)) !== undefined
  }

  private swap(indexA: number, indexB: number): void {
    [this.nodes[indexA], this.nodes[indexB]] = [this.nodes[indexB], this.nodes[indexA]]
  }

  isEmpty(): boolean {
    return this.nodes.length === 0
  }

  peek(): Option<T> {
    if (this.nodes.length === 0)
      return Option.none()

    return Option.some(this.nodes[0])
  }

  poll(): Option<T> {
    if (this.nodes.length === 0)
      return Option.none()

    const value = this.peek()

    this.nodes[0] = this.nodes.pop()!
    this.siftDown()

    return value
  }

  add(value: T): void {
    this.nodes.push(value)
    this.siftUp()
  }

  siftUp(): void {
    let index = this.nodes.length - 1

    // REVISE: Provide selector, and we end up with only one heap implementation.
    // REVIEW: How do we know that there is a value at `index` every iteration?
    while (this.hasParent(index) && this.getParent(index).unwrap() > this.nodes[index]) {
      this.swap(Heap.getParentIndex(index), index)
      index = Heap.getParentIndex(index)
    }
  }

  siftDown() {
    let index = 0

    // NOTE: We only check for left child, because then it is guaranteed that
    // there exists a right child. This is because the heap's values are based
    // of a complete binary tree.
    while (this.hasLeftChild(index)) {
      const rightChildOpt = this.getRightChild(index)
      const leftChild = this.getLeftChild(index).unwrap()
      let smallerChildIndex = Heap.getLeftChildIndex(index)

      // REVISE: Provide selector, and we end up with only one heap implementation.
      if (rightChildOpt.isSome() && rightChildOpt.unwrap() < leftChild)
        smallerChildIndex = Heap.getRightChildIndex(index)

      if (this.nodes[index] < this.nodes[smallerChildIndex])
        break
      else
        this.swap(index, smallerChildIndex)

      index = smallerChildIndex
    }
  }
}
