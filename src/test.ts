import chalk from "chalk"
import { Either, MaybeOk, Result } from "./either.js"
import { Util } from "./util.js"

type UnitTest = [string, Util.Thunk<MaybeOk>]

export function expect<T>(value: T): TestBuilder<T> {
  return new TestBuilder(value)
}

export function assert(condition: boolean): TestBuilder<boolean> {
  return expect(condition).toEqual(true)
}

export enum Type {
  Object = "object",
  Function = "function",
  String = "string",
  Number = "number",
  BigInt = "bigint",
  Undefined = "undefined",
  Boolean = "boolean",
  Array = "array"
}

export type TestFunctor<T> = (instance: TestBuilder<T>) => MaybeOk

export class TestBuilder<T> {
  private static determineTypeOf(value: unknown): Type {
    if (Array.isArray(value))
      return Type.Array

    // REVIEW: Casting.
    return typeof value as Type
  }

  private chain: Util.ThunkWithParam<this, MaybeOk>[]

  constructor(public readonly value: T) {
    this.chain = []
  }

  private compareElements<U>(arrayA: U[], arrayB: U[]): MaybeOk {
    for (const [a, b] of Util.zip(arrayA, arrayB))
      // TODO: Add an equality helper for deep comparisons.
      if (a.isNone() || b.isNone() || a.unwrap() !== b.unwrap())
        // TODO: Need a more descriptive message. Perhaps compare diffs?
        return Either.right(new Error(`Element differs: ${a.unwrap()} vs. ${b.unwrap()}`))

    return Either.ok()
  }

  private compareWithArray<U extends Array<any>>(array: U): MaybeOk {
    if (typeof this.value !== "object" || this.value === null || !Array.isArray(this.value))
      return Either.right(new Error("Value is not an array"))
    else if (this.value.length !== array.length)
      return Either.right(new Error(`Array lengths differ: ${this.value.length} vs. ${array.length}`))

    return this.compareElements(this.value, array)
  }

  private compareWithObject<U extends object>(object: U): MaybeOk {
    if (typeof this.value !== "object" || this.value === null)
      return Either.right(new Error("Value is not an object"))

    const valueKeys = Object.keys(this.value)
    const objectKeys = Object.keys(object)

    if (valueKeys.length !== objectKeys.length)
      return Either.right(new Error("Objects differ in key lengths"))

    return this.compareElements(valueKeys, objectKeys)
  }

  toEqual(other: T): this {
    return this.to(_ => {
      if (Array.isArray(this.value))
        return this.compareWithArray(other as any)

      return Either.if(this.value === other, new Error("Values are not equal"))
    })
  }

  toBeTruthy(): this {
    return this.assert(_ => !!this.value, new Error("Value is not truthy"))
  }

  toBeFalsy(): this {
    return this.assert(_ => !this.value, new Error("Value is not falsy"))
  }

  toBeOfType(type: Type): this {
    return this.assert(_ => TestBuilder.determineTypeOf(this.value) === type, new Error("Type mismatch"))
  }

  toBeInstanceOf(other: Function): this {
    return this.assert(_ => this.value instanceof other, new Error("Instance mismatch"))
  }

  // TODO: Not so simple! The value is evaluated before this is called.
  toThrow(): this {
    return this.to(_ =>
      Either.if(this.value instanceof Function, new Error("Value is not a function; it will never throw"))
    )
  }

  toBeNull(): this {
    return this.assert(_ => this.value === null, new Error("Value is not null"))
  }

  toBeArrayOfSize(size: number): this {
    return this.to(_ => {
      if (!Array.isArray(this.value))
        return Either.right(new Error("Value is not an array"))

      return Either.if(this.value.length === size, new Error("Array size differs from expected size"))
    })
  }

  assert(condition: Util.ThunkWithParam<this, boolean>, error: Error = new Error("Unmet condition")): this {
    return this.to(() => Either.if(condition(this), error))
  }

  to(functor: TestFunctor<T>): this {
    this.chain.push(functor)

    return this
  }

  try(): MaybeOk {
    for (const test of this.chain) {
      const result = test(this)

      if (result.isRight)
        return result
    }

    return Either.ok()
  }
}

export class TestSuite {
  private readonly tests: UnitTest[]

  readonly name: string

  constructor(namedEntity: Function | string) {
    this.tests = []
    this.name = namedEntity instanceof Function ? namedEntity.name : namedEntity
  }

  test<T>(entity: string | Function, callback: Util.Thunk<TestBuilder<T>>): this {
    const name = entity instanceof Function ? entity.name : entity

    this.tests.push([name, () => callback().try()])

    return this
  }

  run(): void {
    console.log(chalk.bgBlue.black(" RUN "), this.name)

    let failingTests: [string, string][] = []

    for (const test of this.tests) {
      let result: MaybeOk
      const startTime = performance.now()

      try {
        result = test[1]()
      }
      catch (error) {
        if (error instanceof Error)
          result = Either.right(new Error(`Uncaught exception: ${error.message}`))
        else
          result = Either.right(new Error("Uncaught exception, which is not an error object"))
      }

      const runtime = Math.floor(performance.now() - startTime)
      const runtimeString = `${runtime}ms`

      const runtimeColoredString =
        // REVISE: Hard-coded limit. Perhaps taking it in as a default option would be better.
        runtime >= 100 ? chalk.red(runtimeString) : runtimeString

      if (result.isRight) {
        // CONSIDER: Combine log messages.
        console.log(`  ${chalk.red("✗".trim())} ${test[0]} (${runtimeColoredString})`)
        failingTests.push([test[0], result.right().message])
      }
      else
        console.log(chalk.gray(`  ${chalk.green("✓")} ${test[0]} (${runtimeColoredString})`))
    }

    // Add a newline to separate output.
    console.log()

    if (failingTests.length === 0)
      console.log(chalk.bgGreen.black(" PASS "))
    else {
      console.log(chalk.bgRed.black(" FAIL "))
      failingTests.forEach(failingTest => console.log(`  ${chalk.red("✗")} ${failingTest[0]}: ${failingTest[1]}`))
    }
  }
}
