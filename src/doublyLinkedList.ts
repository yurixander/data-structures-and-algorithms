import { Option } from "./option";
import { SinglyLinkedList } from "./singlyLinkedList";

export class DoublyLinkedList<T> extends SinglyLinkedList<T> {
  constructor(
    value: T,
    next: Option<DoublyLinkedList<T>> = Option.none(),
    public previous: Option<DoublyLinkedList<T>> = Option.none()
  ) {
    super(value, next)
  }

  findHead(): DoublyLinkedList<T> {
    let current: DoublyLinkedList<T> = this

    while (current.previous.isSome())
      current = current.previous.unwrap()

    return current
  }
}
