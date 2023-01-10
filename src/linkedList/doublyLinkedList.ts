import {Maybe} from "../monad/maybe.js"
import {SinglyLinkedList} from "./singlyLinkedList.js"

export class DoublyLinkedList<T> extends SinglyLinkedList<T> {
  constructor(
    value: T,
    next: Maybe<DoublyLinkedList<T>> = Maybe.nothing(),
    public previous: Maybe<DoublyLinkedList<T>> = Maybe.nothing()
  ) {
    super(value, next)
  }

  findHead(): DoublyLinkedList<T> {
    let current: DoublyLinkedList<T> = this

    while (current.previous.isSome())
      current = current.previous.getOrDo()

    return current
  }
}
