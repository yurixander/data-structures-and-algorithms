import {Maybe} from "./maybe.js"
import {SinglyLinkedList} from "./singlyLinkedList.js"

export class DoublyLinkedList<T> extends SinglyLinkedList<T> {
  constructor(
    value: T,
    next: Maybe<DoublyLinkedList<T>> = Maybe.none(),
    public previous: Maybe<DoublyLinkedList<T>> = Maybe.none()
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
