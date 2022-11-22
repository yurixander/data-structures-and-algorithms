import { SinglyLinkedList } from "./singlyLinkedList.js"
import { expect, TestSuite } from "./test.js"

abstract class Hydrate {
  static get singlyLinkedList(): SinglyLinkedList<number> {
    return new SinglyLinkedList(1)
  }

  static transform<T, U>(value: T) {
    return (callback: (_: T) => U | void) => {
      const result = callback(value)

      return result === undefined ? value : result
    }
  }
}

new TestSuite(SinglyLinkedList.name)
  .test("initialize", () => expect(Hydrate.singlyLinkedList).toBeInstanceOf(SinglyLinkedList))
  .test("reverse", () => expect(Hydrate.transform(Hydrate.singlyLinkedList)(_ => {
    _.reverseImperative()

    return _.collectIterative().map(_ => _.value)
  })).toEqual([1, 2, 3]))
  .run()
