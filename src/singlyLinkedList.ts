import { CallbackWithParam } from "./common"
import { Option } from "./option"

export class SinglyLinkedList<T> {
  constructor(public value: T, public next: Option<SinglyLinkedList<T>> = Option.none()) {
    //
  }

  [Symbol.iterator](): Iterator<SinglyLinkedList<T>> {
    // TODO: Optimize.
    return this.collectIterative().values()
  }

  reverse(): void {
    let bufferOpt = Option.some<SinglyLinkedList<T>>(this)
    let previous = Option.none<SinglyLinkedList<T>>()

    while (bufferOpt.isSome()) {
      let buffer = bufferOpt.unwrap()
      let next = buffer.next;

      [buffer.next, bufferOpt] = [previous, next]
    }
  }

  traverse(callback: CallbackWithParam<SinglyLinkedList<T>>): void {
    this.collectIterative().forEach(node => callback(node))
  }

  find(predicate: CallbackWithParam<SinglyLinkedList<T>, boolean>): Option<SinglyLinkedList<T>> {
    let list = this.collectIterative()

    for (let node of list)
      if (predicate(node))
        return Option.some(node)

    return Option.none()
  }

  filter(predicate: CallbackWithParam<SinglyLinkedList<T>, boolean>): SinglyLinkedList<T>[] {
    return this.collectIterative().filter(node => predicate(node))
  }

  findNthNode(position: number): Option<SinglyLinkedList<T>> {
    return Option.try(this.collectIterative()[position])
  }

  findTail(): SinglyLinkedList<T> {
    let list = this.collectIterative()

    return list[list.length - 1]
  }

  findMiddle(): SinglyLinkedList<T> {
    let list = this.collectIterative()

    return list[Math.floor(list.length / 2)]
  }

  deleteNthNode(position: number): boolean {
    let list = this.collectIterative()

    if (!Util.validateIndex(position, list.length))
      return false

    // TODO: Continue implementation.

    return true
  }

  collectIterative(): SinglyLinkedList<T>[] {
    let list: SinglyLinkedList<T>[] = []
    let buffer: Option<SinglyLinkedList<T>> = Option.some(this)

    while (buffer !== Option.none()) {
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
    let next = this.next

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

let node = new SinglyLinkedList(5)
