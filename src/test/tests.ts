import {BinaryTree, TreeTraversalOrder} from "../tree/binaryTree.js"
import {DoublyLinkedList} from "../linkedList/doublyLinkedList.js"
import {Either} from "../monad/either.js"
import {Graph} from "../graph.js"
import {Matrix} from "../matrix.js"
import {Heap} from "../tree/heap.js"
import {PriorityQueue} from "../priorityQueue.js"
import {SinglyLinkedList} from "../linkedList/singlyLinkedList.js"
import {Stream} from "../stream.js"
import {assert, assertThrows, expect, suite} from "./test.js"
import {Maybe} from "../monad/maybe.js"
import {State} from "../monad/state.js"

enum Size {
  Zero = 0,
  One = 1,
  Two = 2,
  Three = 3,
  Medium = 100,
  Large = 100_000
}

const testValue = 1

abstract class Hydrate {
  static singlyLinkedList(size: Size = Size.One): SinglyLinkedList<number> {
    let counter = 0
    let head: SinglyLinkedList<number> | null = null
    let previous: SinglyLinkedList<number> | null = null

    while (counter !== size) {
      const node = new SinglyLinkedList(counter + 1)

      if (head === null)
        head = node
      else
        previous!.next = Maybe.just(node)

      previous = node
      counter++
    }

    return head!
  }

  static option(value: number | null = null): Maybe<number> {
    return new Maybe(value)
  }

  static get matrix(): Matrix<number> {
    return Matrix
      .unit<number>(3, 3)
      .left()
      .unwrap("a 3x3 matrix should have correct bounds")
  }

  static map<T, U>(value: T) {
    return (callback: (_: T) => U | void) => {
      const result = callback(value)

      return result === undefined ? value : result
    }
  }
}

suite(SinglyLinkedList)
  .test("constructor", () => expect(Hydrate.singlyLinkedList()).toBeInstanceOf(SinglyLinkedList))
  .test(
    SinglyLinkedList.prototype.collectIterative,
    () => expect(Hydrate.singlyLinkedList(Size.Medium).collectIterative())
      .toBeArrayOfLength(Size.Medium)
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
    () => expect(Hydrate.singlyLinkedList(Size.Three).findTail().value).toEqual(Size.Three)
  )
  .test(
    SinglyLinkedList.prototype.count,
    () => expect(Hydrate.singlyLinkedList().count()).toEqual(Size.One)
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
    () => expect(Hydrate.singlyLinkedList(Size.Large).findNthNode(50).getOrDo().value).toEqual(51)
  )
  .test(
    SinglyLinkedList.prototype.filter,
    () => expect(Hydrate.singlyLinkedList(Size.Medium).filter(_ => _.value >= 50)).toBeArrayOfLength(51)
  )
  .test(
    SinglyLinkedList.prototype.deleteNthNode,
    () => expect(Hydrate.map(Hydrate.singlyLinkedList(Size.Medium))(_ => {
      _.deleteNthNode(Size.Medium / 2)

      return _.collectIterative()
    }))
      .toBeArrayOfLength(Size.Medium - 1)
  )
  .test(
    SinglyLinkedList.prototype.insertAfter,
    () => expect(Hydrate.map(Hydrate.singlyLinkedList(Size.One))(_ => {
      _.insertAfter(Hydrate.singlyLinkedList(Size.One))

      return _.collectIterative()
    }))
      .toBeArrayOfLength(Size.One + 1)
  )
  .run()

// suite({Util})
//   .test(
//     Util.unimplemented,
//     () => assertThrows(() => Util.unimplemented())
//   )
//   .test(
//     Util.validateIndex,
//     () => [
//       assert(!Util.validateIndex(0, 0)),
//       assert(Util.validateIndex(0, 1)),
//       assert(!Util.validateIndex(-1, 1))
//     ]
//   )
//   .test(
//     Util.range,
//     () => [
//       expect(Util.range(0, 3)).toEqual([0, 1, 2, 3]),
//       assertThrows(() => Util.range(1, 0))
//     ]
//   )
//   .run()

suite(DoublyLinkedList)
  .run()

suite(Matrix)
  // BUG: Throwing.
  // .test(
  //   Matrix.prototype.get,
  //   () => expect(Hydrate.matrix.get(-1, -1)).toBeNone()
  // )
  .test(
    Matrix.prototype.isFull,
    () => assert(!Hydrate.matrix.isFull())
  )
  .run()

suite(PriorityQueue)
  .run()

suite(Stream)
  .test(
    Stream.prototype.take,
    () => expect(Stream.fibonacci.take(5).toArrayImperative()).toEqual([0, 1, 1, 2, 3])
  )
  .run()

suite(Graph)
  .run()

suite(BinaryTree)
  .run()

suite(Heap)
  .run()

suite(Either)
  .test(
    Either.prototype.left,
    () => [
      expect(Either.left(null).left()).toEqualComparable(Maybe.nothing()),
      assertThrows(() => Either.right(null).left())
    ]
  )
  .run()

suite(Maybe)
  .test(
    Maybe.prototype.bind,
    () => assert(Hydrate.option(testValue).bind(() => Maybe.nothing()).isNone())
  )
  .test(
    Maybe.prototype.isSome,
    () => assert(Hydrate.option(testValue).isSome())
  )
  .test(
    Maybe.prototype.isNone,
    () => assert(Hydrate.option().isNone())
  )
  .test(Maybe.prototype.unwrapOrDefault,
    () => expect(Hydrate.option().unwrapOrDefault(testValue)).toEqual(testValue)
  )
  .test(Maybe.prototype.getOrDo, () => [
    assertThrows(() => Hydrate.option().getOrDo()),
    expect(Hydrate.option(testValue).getOrDo()).toEqual(testValue)
  ])
  .test(Maybe.prototype.unwrap, () => [
    assertThrows(() => Hydrate.option().unwrap("")),
    expect(Hydrate.option(testValue).unwrap("")).toEqual(testValue)
  ])
  .test(Maybe.prototype.map, () => [
    assert(Hydrate.option().map(() => testValue).isNone()),
    expect(Hydrate.option(testValue).map(_ => _ + 1).getOrDo()).toEqual(testValue + 1)
  ])
  .run()

suite(State)
  .test("do", () => {
    const state = State.get<number>().map(x => x + 1).bind(State.set)

    return expect(state.run(0)).toEqual([undefined, 1])
  })
  .run()

const binaryTree = new BinaryTree("A")

binaryTree.left = Maybe.just(new BinaryTree("B"))
binaryTree.right = Maybe.just(new BinaryTree("C"))
binaryTree.traverse(node => console.log(node.value), TreeTraversalOrder.InOrder)
