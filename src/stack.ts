import {DoublyLinkedList} from "./doublyLinkedList"
import {Option} from "./option"

export class Stack<T> {
  private tailOpt: Option<DoublyLinkedList<T>>
  private size_: number

  constructor() {
    this.tailOpt = Option.none()
    this.size_ = 0
  }

  // TODO: Implement iterator.

  get size(): number {
    return this.size_
  }

  top(): Option<T> {
    return this.tailOpt.map(tail => tail.value)
  }

  push(value: T): void {
    const node = new DoublyLinkedList(value)

    if (this.tailOpt.isNone())
      this.tailOpt = Option.some(node)
    else {
      const tail = this.tailOpt.unwrap()

      tail.next = Option.some(node)
      node.previous = this.tailOpt
      this.tailOpt = Option.some(node)
    }

    this.size_++
  }

  pop(): Option<T> {
    if (this.tailOpt.isNone())
      return Option.none()

    const tail = this.tailOpt.unwrap()

    if (tail.previous.isSome()) {
      const nextTail = tail.previous.unwrap()

      nextTail.next = Option.none()
      this.tailOpt = Option.some(nextTail)
    }
    else
      this.tailOpt = Option.none()

    this.size_--

    return Option.some(tail.value)
  }
}
