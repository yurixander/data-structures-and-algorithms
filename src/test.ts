import chalk from "chalk"
import { Either, MaybeOk } from "./either.js"
import { Option } from "./option.js"
import { Util } from "./util.js"

enum TestType {
  Unit
}

type IndexableObject = { [propertyName: string]: any }

type Test = {
  type: TestType,
  name: string,
  executor?: Util.Thunk<MaybeOk>
}

export function suite(target: IndexableObject | Function): TestSuite {
  return new TestSuite(target)
}

export function expect<T>(value: T): TestBuilder<T> {
  // CONSIDER: If the value is a thunk, consider executing it (maybe taking a parameter?). This might help with errors thrown?
  return new TestBuilder(value)
}

export function assert(condition: boolean, message?: string): TestBuilder<boolean> {
  // TODO: Use message.
  return expect(condition).toEqual(true)
}

export function assertThrows(thunk: () => unknown, cause?: string): TestBuilder<() => unknown> {
  return expect(thunk).to(_ => {
    try {
      _.value()

      return Either.error("No error was thrown")
    }
    catch (error) {
      // REVISE: Simplify.
      if (cause !== undefined && !(error instanceof Error))
        return Either.error("Expected error but caught different object")
      else if (cause !== undefined && error instanceof Error)
        return Either.if(error.cause !== cause, new Error("Error cause mismatch"))

      return Either.ok()
    }
  })
}

export enum Type {
  Object = "object",
  Function = "function",
  String = "string",
  Number = "number",
  BigInt = "bigint",
  Undefined = "undefined",
  Null = "null",
  Boolean = "boolean",
  Array = "array"
}

export type Matcher<T> = (instance: TestBuilder<T>) => MaybeOk

export class TestBuilder<T> {
  private static determineTypeOf(value: unknown): Type {
    if (Array.isArray(value))
      return Type.Array
    else if (value === null)
      return Type.Null

    // REVIEW: Casting.
    return typeof value as Type
  }

  private chain: Util.ThunkWithParam<this, MaybeOk>[]

  constructor(public readonly value: T) {
    this.chain = []
  }

  private difference<A, B>(actual: A, expected: B): string {
    return [
      chalk.green(`\n      + ${JSON.stringify(expected)}`),
      chalk.red(`\n      - ${JSON.stringify(actual)}`)
    ].join("")
  }

  private compareElements<U>(arrayA: U[], arrayB: U[]): MaybeOk {
    for (const [a, b] of Util.zip(arrayA, arrayB))
      // TODO: Add an equality helper for deep comparisons.
      if (a.isNone() || b.isNone() || a.unwrap() !== b.unwrap())
        // TODO: Need a more descriptive message. Perhaps compare diffs?
        // BUG: Cannot unwrap if it is none. Temporarily passing in the entire object.
        return Either.error(`Element differs ${this.difference(a, b)}`)

    return Either.ok()
  }

  private compareWithArray<U extends Array<any>>(expected: U): MaybeOk {
    if (typeof this.value !== "object" || this.value === null || !Array.isArray(this.value))
      return Either.right(new Error("Value is not an array"))
    else if (this.value.length !== expected.length)
      return Either.error(`Array lengths differ ${this.difference(this.value.length, expected.length)}`)

    return this.compareElements(this.value, expected)
  }

  private compareWithObject<U extends object>(object: U): MaybeOk {
    if (typeof this.value !== "object" || this.value === null)
      return Either.error("Value is not an object")

    const valueKeys = Object.keys(this.value)
    const objectKeys = Object.keys(object)

    if (valueKeys.length !== objectKeys.length)
      return Either.error("Objects differ in key lengths")

    return this.compareElements(valueKeys, objectKeys)
  }

  toEqual(expected: T): this {
    return this.to(_ => {
      if (Array.isArray(this.value))
        return this.compareWithArray(expected as any)

      return Either.if(
        this.value === expected,
        new Error(`Values are not equal ${this.difference(this.value, expected)}`)
      )
    })
  }

  toBeTruthy(): this {
    return this.assert(_ => !!this.value, new Error("Value is not truthy"))
  }

  toBeFalsy(): this {
    return this.assert(_ => !this.value, new Error("Value is not falsy"))
  }

  toBeOfType(expected: Type): this {
    const actual = TestBuilder.determineTypeOf(this.value)

    return this.assert(
      _ => actual === expected,
      new Error(`Type mismatch ${this.difference(actual, expected)}`)
    )
  }

  toBeInstanceOf(other: Function): this {
    return this.assert(_ => this.value instanceof other, new Error("Instance mismatch"))
  }

  toBeNull(): this {
    return this.assert(_ => this.value === null, new Error("Value is not null"))
  }

  toBeArrayOfLength(length: number): this {
    return this.to(_ => {
      if (!Array.isArray(this.value))
        return Either.error("Value is not an array")

      return Either.if(
        this.value.length === length,
        new Error(`Array length differs from expected size ${this.difference(this.value.length, length)}`)
      )
    })
  }

  toBeOption(isSome: boolean): this {
    return this.to(_ => {
      if (!(this.value instanceof Option))
        return Either.error("Value is not an instance of Option")

      const condition = this.value.isSome() === isSome

      return Either.if(condition, new Error(`Value is ${condition ? "some" : "none"}`))
    })
  }

  toBeSome(): this {
    return this.toBeOption(true)
  }

  toBeNone(): this {
    return this.toBeOption(false)
  }

  toMatchPartial(partial: Partial<T>): this {
    return this.to(_ => {
      if (typeof this.value !== "object" || this.value === null)
        return Either.error(`Value is not an object ${this.difference(TestBuilder.determineTypeOf(this.value), "object")}`)

      const object = this.value as { [_: string]: unknown }
      const partialKeys = Object.keys(partial)
      const valueKeys = Object.keys(this.value)

      if (partialKeys.length > valueKeys.length)
        return Either.error(`Partial object has more keys than value ${this.difference(valueKeys.length, partialKeys.length)}`)

      for (const partialKey in partial) {
        const objectValue = object[partialKey]
        const partialValue = partial[partialKey]

        if (objectValue === undefined)
          return Either.error(`Value is missing key, or property is undefined: ${partialKey} ${this.difference(undefined, partialValue)}`)
        // TODO: Use deep comparison.
        else if (objectValue !== partialValue)
          return Either.error(`Object property mismatch: ${partialKey} ${this.difference(objectValue, partialValue)}`)
      }

      return Either.ok()
    })
  }

  map<U>(callback: Util.ThunkWithParam<T, U>): TestBuilder<U> {
    // let next = new TestBuilder(callback(this.value))

    // next.chain = this.chain

    // TODO: Finish implementing.
    Util.unimplemented()
  }

  assert(
    condition: Util.ThunkWithParam<this, boolean>,
    error: Error = new Error("Unmet condition")
  ): this {
    return this.to(() => Either.if(condition(this), error))
  }

  not(matcher: Matcher<T>): this {
    // TODO: Implement.
    Util.unimplemented()
  }

  to(functor: Matcher<T>): this {
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
  private readonly tests: Test[]
  private todos: Set<string>

  readonly name: string

  constructor(target: Function | IndexableObject | string) {
    this.tests = []
    this.todos = new Set()

    if (target instanceof Function) {
      for (const propertyName of Object.getOwnPropertyNames(target.prototype))
        // REVISE: Should be registered by reference to the function, not simply by name string.
        this.todos.add(propertyName)

      this.name = target.name
    }
    else if (target instanceof Object) {
      const targetKeys = Object.keys(target)
      const name = targetKeys.at(0)

      this.name = name ?? chalk.bgRed.black(" Unknown ")

      if (name !== undefined)
        for (const propertyName of Object.getOwnPropertyNames(target[name]))
          this.todos.add(propertyName)
    }
    else
      this.name = target
  }

  private beautifyErrorStack(stack: string | undefined): string {
    if (stack === undefined)
      return ""

    const spacing = "        "

    return spacing + stack
      .split("\n")
      .slice(1)
      .map(line => chalk.gray("• " + line.trim().slice(3)))
      .join("\n" + spacing)
  }

  // REVIEW: Using `any`.
  // CONSIDER: Restricting target's name to `keyof typeof T`.
  test(target: string | Function, callback: Util.Thunk<TestBuilder<any> | TestBuilder<any>[]>): this {
    let name = target instanceof Function ? target.name : target

    if (name === this.name)
      name = "constructor"

    if (this.todos.has(name))
      this.todos.delete(name)

    const result = callback()
    const tests = Array.isArray(result) ? result : [result]

    for (const test of tests)
      this.tests.push({
        name,
        type: TestType.Unit,
        executor: test.try.bind(test)
      })

    return this
  }

  // REVISE: This isn't pure (IO effect).
  run(): void {
    const totalTests = this.tests.length + this.todos.size
    const registeredTests = this.tests.length
    const coverageRatio = Math.floor(registeredTests / totalTests * 100)

    let coverageColor: (_: string) => string

    if (coverageRatio < 50)
      coverageColor = chalk.red
    else if (coverageRatio < 80)
      coverageColor = chalk.yellow
    else if (coverageRatio < 90)
      coverageColor = chalk.gray
    else
      coverageColor = chalk.green

    console.log(this.name, coverageColor(`(${coverageRatio}% coverage)`))

    let overallRuntime = 0
    let failingTests: [string, string][] = []
    const sortedTests = [...this.tests].sort((a, b) => a.name > b.name ? 1 : -1)

    for (const todoName of this.todos)
      console.log(`  ${chalk.yellow("⋈")} ` + chalk.gray(`todo: ${todoName}`))

    for (const test of sortedTests) {
      if (test.executor === undefined)
        continue

      let result: MaybeOk
      const startTime = performance.now()

      try {
        result = test.executor()
      }
      catch (error) {
        if (error instanceof Error)
          result = Either.error(`Uncaught exception: ${error.message}\n${this.beautifyErrorStack(error.stack)}`)
        else
          result = Either.error("Uncaught exception, which is not an error object")
      }

      const runtime = Math.floor(performance.now() - startTime)
      const runtimeString = `${runtime}ms`

      overallRuntime += runtime

      const runtimeColoredString =
        // REVISE: Hard-coded limit. Perhaps taking it in as a default option would be better.
        runtime >= 100 ? chalk.red(runtimeString) : runtimeString

      if (result.isRight) {
        // CONSIDER: Combine log messages.
        console.log(`  ${chalk.red("✗")} ${test.name} (${runtimeColoredString})`)
        failingTests.push([test.name, result.right().message])
      }
      else
        console.log(chalk.gray(`  ${chalk.green("✓")} ${test.name} (${runtimeColoredString})`))
    }

    // Add a newline to separate output.
    console.log()

    if (failingTests.length === 0)
      console.log(" ", chalk.bgGreen.black(" PASS "), chalk.gray(`${overallRuntime}ms`))
    else {
      console.log(" ", chalk.bgRed.black(" * FAIL "), chalk.gray(`${overallRuntime}ms`))
      failingTests.forEach(failingTest => console.log(`    ${chalk.red("*")} ${failingTest[0]}: ${failingTest[1]}`))
    }

    console.log()
  }
}
