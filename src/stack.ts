import {DoublyLinkedList} from "./linkedList/doublyLinkedList"
import {Maybe} from "./monad/maybe"

export class Stack<T> {
  private tailOpt: Maybe<DoublyLinkedList<T>>
  private size_: number

  constructor() {
    this.tailOpt = Maybe.none()
    this.size_ = 0
  }

  // TODO: Implement iterator.

  get size(): number {
    return this.size_
  }

  top(): Maybe<T> {
    return this.tailOpt.map(tail => tail.value)
  }

  push(value: T): void {
    const node = new DoublyLinkedList(value)

    if (this.tailOpt.isNone())
      this.tailOpt = Maybe.some(node)
    else {
      const tail = this.tailOpt.getOrDo()

      tail.next = Maybe.some(node)
      node.previous = this.tailOpt
      this.tailOpt = Maybe.some(node)
    }

    this.size_++
  }

  pop(): Maybe<T> {
    if (this.tailOpt.isNone())
      return Maybe.none()

    const tail = this.tailOpt.getOrDo()

    if (tail.previous.isSome()) {
      const nextTail = tail.previous.getOrDo()

      nextTail.next = Maybe.none()
      this.tailOpt = Maybe.some(nextTail)
    }
    else
      this.tailOpt = Maybe.none()

    this.size_--

    return Maybe.some(tail.value)
  }
}
