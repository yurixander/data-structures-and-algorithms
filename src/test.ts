import { Either, Result } from "./either"
import { Util } from "./util"

type UnitTest = [string, Util.Thunk<Result<TestBuilder>>]

export function expect<T>(value: T): TestBuilder {
  return new TestBuilder(value)
}

export enum Type {
  Object = "object",
  Function = "function",
  String = "string",
  Number = "number",
  BigInt = "bigint",
  Undefined = "undefined",
  Boolean = "boolean"
}

export class TestBuilder {
  constructor(private readonly value: unknown) {
    //
  }

  toBeOfType(type: Type): Result<this> {
    if (typeof this.value !== type)
      return Either.right(new Error(`Expected type '${type}', got '${typeof this.value}'`))

    return Either.left(this)
  }

  private compareElements(arrayA: unknown[], arrayB: unknown[]): Result<this> {
    for (const [a, b] of Util.zip(arrayA, arrayB))
      // TODO: Add an equality helper for deep comparisons.
      if (a.isNone() || b.isNone() || a.unwrap() !== b.unwrap())
        // TODO: Need a more descriptive message. Perhaps compare diffs?
        return Either.right(new Error(`Element differs: ${a.unwrap()} vs. ${b.unwrap()}`))

    return Either.left(this)
  }

  toEqualArray(array: unknown[]): Result<this> {
    if (typeof this.value !== "object" || this.value === null || !Array.isArray(this.value))
      return Either.right(new Error("Value is not an array"))
    else if (this.value.length !== array.length)
      return Either.right(new Error("Array lengths differ"))

    return this.compareElements(this.value, array)
  }

  toEqualObject(object: object): Result<this> {
    if (typeof this.value !== "object" || this.value === null)
      return Either.right(new Error("Value is not an object"))

    const valueKeys = Object.keys(this.value)
    const objectKeys = Object.keys(object)

    if (valueKeys.length !== objectKeys.length)
      return Either.right(new Error("Objects differ in key lengths"))

    return this.compareElements(valueKeys, objectKeys)
  }
}

export class TestSuite {
  private readonly tests: UnitTest[]

  constructor(public readonly name: string) {
    this.tests = []
  }

  test(name: string, callback: Util.Thunk<Result<TestBuilder>>): this {
    this.tests.push([name, callback])

    return this
  }

  run(): void {
    let failingTests: [string, string][] = []

    for (const test of this.tests) {
      const result = test[1]()

      if (result.isRight) {
        console.log(`[FAIL] Test failed: ${test[0]}, ${result.right().message}`)
        failingTests.push([test[0], result.right().message])
      }
      else
        console.log(`[OK] Test passed: ${test[0]}`)
    }

    // Add a newline to separate output.
    console.log()

    if (failingTests.length === 0)
      console.log(`=== All ${this.tests.length} tests completed successfully ===`)
    else {
      console.log(`=== Finished with ${this.tests.length - failingTests.length} passing and ${failingTests.length} failing tests ===`)
      console.log("Failing tests:")
      failingTests.forEach(failingTest => console.log(`  - ${failingTest[0]}: ${failingTest[1]}`))
    }
  }
}
