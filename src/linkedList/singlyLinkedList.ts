import {ForwardIterable, ForwardIterator} from "../iterator/iterator.js"
import {Maybe} from "../monad/maybe.js"
import {CallbackWithParam, validateIndex} from "../util.js"

export class SinglyLinkedList<T> implements ForwardIterable<SinglyLinkedList<T>> {
  constructor(
    public value: T,
    public next: Maybe<SinglyLinkedList<T>> = Maybe.none()
  ) {
    //
  }

  *[Symbol.iterator](): Iterator<SinglyLinkedList<T>> {
    // OPTIMIZE: Collect as needed (recall it's a generator).
    const nodes = this.collectIterative()

    for (const node of nodes)
      yield node
  }

  iter(): ForwardIterator<SinglyLinkedList<T>> {
    return new ForwardIterator(this)
  }

  any(predicate: (value: T) => boolean): boolean {
    return this.collectIterative().some(node => predicate(node.value))
  }

  all(predicate: (value: T) => boolean): boolean {
    return this.collectIterative().every(node => predicate(node.value))
  }

  contains(value: T): boolean {
    return this.collectIterative()
      .map(node => node.value)
      .includes(value)
  }

  reverseImperative(): SinglyLinkedList<T> {
    // REVISE: Cleanup returning of the new head.

    let bufferOpt = Maybe.some<SinglyLinkedList<T>>(this)
    const previous = Maybe.none<SinglyLinkedList<T>>()
    let newHead: SinglyLinkedList<T>

    while (bufferOpt.isSome()) {
      const buffer = bufferOpt.getOrDo()
      const next = buffer.next;

      [buffer.next, bufferOpt] = [previous, next]

      if (bufferOpt.isNone())
        newHead = buffer
    }

    return newHead!
  }

  traverse(callback: CallbackWithParam<SinglyLinkedList<T>>): void {
    this.collectIterative().forEach(node => callback(node))
  }

  find(predicate: CallbackWithParam<SinglyLinkedList<T>, boolean>): Maybe<SinglyLinkedList<T>> {
    const list = this.collectIterative()

    for (const node of list)
      if (predicate(node))
        return Maybe.some(node)

    return Maybe.none()
  }

  filter(predicate: CallbackWithParam<SinglyLinkedList<T>, boolean>): SinglyLinkedList<T>[] {
    return this.collectIterative().filter(node => predicate(node))
  }

  findNthNode(position: number): Maybe<SinglyLinkedList<T>> {
    return Maybe.try(this.collectIterative()[position])
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
    let buffer: Maybe<SinglyLinkedList<T>> = Maybe.some(this)

    while (buffer.isSome()) {
      list.push(buffer.getOrDo())
      buffer = buffer.getOrDo().next
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

    this.next = Maybe.some(node)
    node.next = next
  }

  detach() {
    this.next = Maybe.none()
  }

  shallowClone(): SinglyLinkedList<T> {
    return new SinglyLinkedList(this.value, this.next)
  }
}
