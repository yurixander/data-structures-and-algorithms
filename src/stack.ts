import {DoublyLinkedList} from "./linkedList/doublyLinkedList.js"
import {Maybe} from "./monad/maybe.js"

export class Stack<T> {
  private tailOpt: Maybe<DoublyLinkedList<T>>
  private sizeMarker: number

  constructor() {
    this.tailOpt = Maybe.nothing()
    this.sizeMarker = 0
  }

  // TODO: Implement iterator.

  get size(): number {
    return this.sizeMarker
  }

  top(): Maybe<T> {
    return this.tailOpt.transform(tail => tail.value)
  }

  push(value: T): void {
    const node = new DoublyLinkedList(value)

    if (this.tailOpt.isNone())
      this.tailOpt = Maybe.just(node)
    else {
      // REVISE: Use `unwrap` instead.
      const tail = this.tailOpt.do()

      tail.next = Maybe.just(node)
      node.previous = this.tailOpt
      this.tailOpt = Maybe.just(node)
    }

    this.sizeMarker++
  }

  pop(): Maybe<T> {
    if (this.tailOpt.isNone())
      return Maybe.nothing()

    const tail = this.tailOpt.do()

    if (tail.previous.isSome()) {
      const nextTail = tail.previous.do()

      nextTail.next = Maybe.nothing()
      this.tailOpt = Maybe.just(nextTail)
    }
    else
      this.tailOpt = Maybe.nothing()

    this.sizeMarker--

    return Maybe.just(tail.value)
  }
}
