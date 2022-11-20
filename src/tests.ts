import { SinglyLinkedList } from "./singlyLinkedList";
import { expect, TestSuite, Type } from "./test";

new TestSuite(SinglyLinkedList.name)
  .test("works well", () => expect(1).toBeOfType(Type.Number))
  .test("does good", () => expect("hi").toBeOfType(Type.Number))
  .test("last one", () => expect([1, 2, 3]).toEqualArray([1, 2, 5]))
  .run()
