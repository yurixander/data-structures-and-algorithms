import { Option } from "./option.js"
import { SinglyLinkedList } from "./singlyLinkedList.js"
import { assert, expect, TestSuite, Type } from "./test.js"

abstract class Hydrate {
  static singlyLinkedList(amount: number = 1): SinglyLinkedList<number> {
    let counter = 0
    let head: SinglyLinkedList<number> | null = null
    let previous: SinglyLinkedList<number> | null = null

    while (counter !== amount) {
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
  // .test(
  //   SinglyLinkedList.prototype.reverseImperative.name,
  //   () => expect(Hydrate.map(Hydrate.singlyLinkedList())(_ => {
  //     _.reverseImperative()

  //     return _.collectIterative().map(_ => _.value)
  //   })).toEqual([1, 2, 3])
  // )
  .test(
    SinglyLinkedList.prototype.detach,
    () => expect(Hydrate.map(Hydrate.singlyLinkedList())(_ => _.detach()))
      .toBeInstanceOf(SinglyLinkedList)
      .toBeOfType(Type.Object)
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
    () => expect(Hydrate.singlyLinkedList(600_000).findMiddle().value).toEqual(300_001)
  )
  .test(
    SinglyLinkedList.prototype.find,
    () => assert(Hydrate.singlyLinkedList(100_000).find(_ => _.value === 50_000).isSome())
  )
  .test(
    SinglyLinkedList.prototype.find,
    () => assert(Hydrate.singlyLinkedList(100_000).find(_ => _.value === 100_001).isNone())
  )
  .run()
