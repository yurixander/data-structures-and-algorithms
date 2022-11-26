import { Option } from "./option.js"
import { ThunkWithParam, validateIndex } from "./util.js"

export class SinglyLinkedList<T> {
  constructor(
    public value: T,
    public next: Option<SinglyLinkedList<T>> = Option.none()
  ) {
    //
  }

  *[Symbol.iterator]() {
    // OPTIMIZE: Collect as needed (recall it's a generator).
    const nodes = this.collectIterative()

    for (const node of nodes)
      yield node
  }

  reverseImperative(): SinglyLinkedList<T> {
    // REVISE: Cleanup returning of the new head.

    let bufferOpt = Option.some<SinglyLinkedList<T>>(this)
    const previous = Option.none<SinglyLinkedList<T>>()
    let newHead: SinglyLinkedList<T>

    while (bufferOpt.isSome()) {
      const buffer = bufferOpt.unwrap()
      const next = buffer.next;

      [buffer.next, bufferOpt] = [previous, next]

      if (bufferOpt.isNone())
        newHead = buffer
    }

    return newHead!
  }

  traverse(callback: ThunkWithParam<SinglyLinkedList<T>>): void {
    this.collectIterative().forEach(node => callback(node))
  }

  find(predicate: ThunkWithParam<SinglyLinkedList<T>, boolean>): Option<SinglyLinkedList<T>> {
    const list = this.collectIterative()

    for (const node of list)
      if (predicate(node))
        return Option.some(node)

    return Option.none()
  }

  filter(predicate: ThunkWithParam<SinglyLinkedList<T>, boolean>): SinglyLinkedList<T>[] {
    return this.collectIterative().filter(node => predicate(node))
  }

  findNthNode(position: number): Option<SinglyLinkedList<T>> {
    return Option.try(this.collectIterative()[position])
  }

  findTail(): SinglyLinkedList<T> {
    const list = this.collectIterative()

    return list[list.length - 1]
  }

  findMiddle(): SinglyLinkedList<T> {
    const list = this.collectIterative()

    return list[Math.floor(list.length / 2)]
  }

  deleteNthNode(position: number): boolean {
    const list = this.collectIterative()

    if (!validateIndex(position, list.length))
      return false

    // TODO: Continue implementation.

    return true
  }

  collectIterative(): SinglyLinkedList<T>[] {
    const list: SinglyLinkedList<T>[] = []
    let buffer: Option<SinglyLinkedList<T>> = Option.some(this)

    while (buffer.isSome()) {
      list.push(buffer.unwrap())
      buffer = buffer.unwrap().next
    }

    // This error is a fail-safe, it should be unreachable.
    if (list.length === 0)
      throw new Error("Singly-linked list is empty")

    return list
  }

  count(): number {
    return this.collectIterative().length
  }

  insertAfter(node: SinglyLinkedList<T>): void {
    const next = this.next

    this.next = Option.some(node)
    node.next = next
  }

  detach() {
    this.next = Option.none()
  }

  shallowClone(): SinglyLinkedList<T> {
    return new SinglyLinkedList(this.value, this.next)
  }
}
