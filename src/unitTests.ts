import { Option } from "./option.js"
import { SinglyLinkedList } from "./singlyLinkedList.js"
import { assert, expect, TestSuite, Type } from "./test.js"

enum Size {
  Zero = 0,
  One = 1,
  Two = 2,
  Three = 3,
  Medium = 100,
  Large = 100_000
}

abstract class Hydrate {
  static singlyLinkedList(size: Size = Size.One): SinglyLinkedList<number> {
    let counter = 0
    let head: SinglyLinkedList<number> | null = null
    let previous: SinglyLinkedList<number> | null = null

    while (counter !== size) {
      let node = new SinglyLinkedList(counter + 1)

      if (head === null)
        head = node
      else
        previous!.next = Option.some(node)

      previous = node
      counter++
    }

    return head!
  }

  static map<T, U>(value: T) {
    return (callback: (_: T) => U | void) => {
      const result = callback(value)

      return result === undefined ? value : result
    }
  }
}

new TestSuite(SinglyLinkedList)
  .test("constructor", () => expect(Hydrate.singlyLinkedList()).toBeInstanceOf(SinglyLinkedList))
  .test(
    SinglyLinkedList.prototype.collectIterative,
    () => expect(Hydrate.singlyLinkedList(Size.Medium).collectIterative())
      .toBeArrayOfSize(Size.Medium)
  )
  .test(
    SinglyLinkedList.prototype.reverseImperative,
    () => expect(Hydrate.map(Hydrate.singlyLinkedList(Size.Three))(_ =>
      // BUG: Returning one node.
      _.reverseImperative().collectIterative().map(_ => _.value)
    ))
      .toEqual([1, 2, 3])
  )
  .test(
    SinglyLinkedList.prototype.detach,
    () => expect(Hydrate.map(Hydrate.singlyLinkedList())(_ => _.detach()))
      .toBeInstanceOf(SinglyLinkedList)
  )
  .test(
    SinglyLinkedList.prototype.findTail,
    () => expect(Hydrate.singlyLinkedList(3).findTail().value).toEqual(3)
  )
  .test(
    SinglyLinkedList.prototype.count,
    () => expect(Hydrate.singlyLinkedList().count()).toEqual(1)
  )
  .test(
    SinglyLinkedList.prototype.findMiddle,
    () => expect(Hydrate.singlyLinkedList(Size.Large).findMiddle().value).toEqual(Size.Large / 2 + 1)
  )
  .test(
    SinglyLinkedList.prototype.find,
    () => assert(Hydrate.singlyLinkedList(Size.Large).find(_ => _.value === Size.Large / 2).isSome())
  )
  .test(
    SinglyLinkedList.prototype.find,
    () => assert(Hydrate.singlyLinkedList(Size.Large).find(_ => _.value === Size.Large + 1).isNone())
  )
  .test(
    SinglyLinkedList.prototype.findNthNode,
    () => expect(Hydrate.singlyLinkedList(Size.Large).findNthNode(50).unwrap().value).toEqual(51)
  )
  .run()
